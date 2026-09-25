# -*- coding: utf-8 -*-
"""
Pont vers edge-tts, appelé par les scripts Node du projet.

── Pourquoi un pont, et pas tout en Python ──

Le texte à lire vient de `src/lib/narration/normaliser.ts`, qui est testé et
qui est la seule source de vérité sur la façon d'écrire un article pour
l'oreille. Le réécrire en Python créerait deux versions à maintenir, qui
divergeraient au premier ajustement. Node calcule donc le texte, ce fichier ne
fait que parler.

── Ce que edge-tts est ──

Un paquet qui s'adresse au service de lecture à voix haute intégré au
navigateur Edge. Mêmes voix neuronales que le service payant de Microsoft,
sans compte, sans clé et sans facturation.

À savoir, et c'est la seule réserve : cet accès n'est pas une API publiée sous
contrat. Microsoft peut le modifier sans préavis. La conséquence est limitée
ici, parce que les fichiers sont produits une fois et servis ensuite depuis
notre propre stockage : une rupture côté Microsoft empêcherait une nouvelle
génération, pas l'écoute de ce qui existe déjà.

── Les repères de mots ──

`boundary='WordBoundary'` fait renvoyer, pour chaque groupe prononcé, son
décalage et sa durée en unités de 100 nanosecondes. Ils servent au surlignage.
Attention : un repère ne correspond pas toujours à un mot du texte source — les
nombres sont regroupés avec le mot suivant. C'est pour cette raison que le
surlignage s'appuie sur les frontières de PHRASES, exactes, et non sur un
alignement mot à mot qui serait faux par endroits.

Usage :
  python scripts/edge_tts_pont.py voix
  python scripts/edge_tts_pont.py synthese <fichier-de-travail.json>

Le fichier de travail :
  { "sortie": "public/ecoute", "debit": "-4%",
    "taches": [ { "voix": "fr-FR-DeniseNeural", "fichier": "denise",
                  "texte": "…", "reperes": true } ] }
"""

import asyncio
import json
import sys
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print(
        "edge-tts n'est pas installe.\n"
        "  python -m pip install edge-tts",
        file=sys.stderr,
    )
    sys.exit(1)


async def lister_voix() -> None:
    """
    Imprime en JSON les voix candidates, telles que le service les declare.

    Deux familles sont retenues :

      - toutes les voix dont la langue est le francais, quel que soit le pays ;
      - toutes les voix MULTILINGUES, y compris celles dont la langue de base
        n'est pas le francais.

    La seconde famille merite l'essai parce que ces voix partagent un meme
    modele, nettement plus naturel en lecture longue que les voix monolingues :
    sur les treize voix francaises, les deux seules multilingues se sont
    imposees a l'ecoute. Reste a entendre si l'accent de leur langue de base
    s'entend quand elles lisent du francais — ce que seule l'oreille tranche.
    """
    toutes = await edge_tts.list_voices()

    candidates = []
    for v in toutes:
        nom_court = v.get("ShortName", "")
        est_francaise = nom_court.startswith("fr-")
        est_multilingue = "Multilingual" in nom_court

        if not est_francaise and not est_multilingue:
            continue

        etiquettes = v.get("VoiceTag", {}) or {}
        candidates.append(
            {
                "id": nom_court,
                "nom": nom_court.split("-")[-1]
                .replace("MultilingualNeural", "")
                .replace("Neural", ""),
                "locale": v.get("Locale", ""),
                "genre": "féminine" if v.get("Gender") == "Female" else "masculine",
                "personnalites": etiquettes.get("VoicePersonalities", []) or [],
                "scenarios": etiquettes.get("ContentCategories", []) or [],
                "multilingue": est_multilingue,
                # « francaise » : langue de base le francais. « multilingue » :
                # modele multilingue dont la langue de base est autre.
                "groupe": "francaise" if est_francaise else "multilingue",
            }
        )

    candidates.sort(key=lambda x: (x["groupe"], x["locale"], x["genre"], x["id"]))
    print(json.dumps(candidates, ensure_ascii=False, indent=1))


# Duree maximale accordee a un segment, en secondes.
#
# Constate en exploitation : un segment s'est bloque treize minutes sans lever
# la moindre erreur. La connexion restait ouverte et le flux ne rendait plus
# rien, si bien que la generation entiere attendait. Sur trois mille segments,
# ce cas n'est pas un accident mais une certitude.
DELAI_SEGMENT = 45

# Tentatives par segment. Un echec est presque toujours transitoire.
TENTATIVES = 3

# Pause entre deux segments, en secondes.
#
# Le service tolere mal une rafale soutenue. Une pause courte coute quelques
# minutes sur l'ensemble et evite les blocages, ce qui est un bon echange.
PAUSE = 0.25


async def _synthetiser_une_fois(tache: dict, debit: str) -> tuple:
    """Un essai de synthese. Rend (audio, mots, phrases)."""
    veut_reperes = bool(tache.get("reperes"))

    parleur = edge_tts.Communicate(
        tache["texte"],
        tache["voix"],
        rate=debit,
        boundary="WordBoundary" if veut_reperes else "SentenceBoundary",
        connect_timeout=15,
        receive_timeout=30,
    )

    morceaux = bytearray()
    mots = []
    phrases = []

    async for bloc in parleur.stream():
        if bloc["type"] == "audio":
            morceaux.extend(bloc["data"])
        elif bloc["type"] == "WordBoundary":
            mots.append(
                {
                    "texte": bloc["text"],
                    # Converti en secondes ici : le lecteur n'a pas a connaitre
                    # l'unite de 100 nanosecondes du protocole de Microsoft.
                    "debut": bloc["offset"] / 10_000_000,
                    "duree": bloc["duration"] / 10_000_000,
                }
            )
        elif bloc["type"] == "SentenceBoundary":
            phrases.append(
                {
                    "texte": bloc["text"],
                    "debut": bloc["offset"] / 10_000_000,
                    "duree": bloc["duration"] / 10_000_000,
                }
            )

    if len(morceaux) == 0:
        raise RuntimeError("aucun octet audio recu")

    return bytes(morceaux), mots, phrases


async def une_tache(tache: dict, sortie: Path, debit: str) -> dict:
    """
    Synthetise une tache, avec delai et reprise.

    Le delai est la piece essentielle : sans lui, un flux qui ne rend plus rien
    immobilise la generation sans jamais echouer. `asyncio.wait_for` transforme
    ce silence en erreur, que la boucle de reprise peut traiter.
    """
    veut_reperes = bool(tache.get("reperes"))

    for essai in range(1, TENTATIVES + 1):
        try:
            audio, mots, phrases = await asyncio.wait_for(
                _synthetiser_une_fois(tache, debit), timeout=DELAI_SEGMENT
            )
            break
        except Exception as erreur:
            # `TimeoutError` est une sous-classe d'`Exception` : la capturer
            # separement serait redondant.
            if essai == TENTATIVES:
                raise RuntimeError(
                    f"{TENTATIVES} tentatives echouees : {type(erreur).__name__} {erreur}"
                ) from erreur
            # Attente croissante : 1 s, puis 3 s.
            await asyncio.sleep(1 + 2 * (essai - 1))

    fichier_audio = sortie / (tache["fichier"] + ".mp3")
    fichier_audio.write_bytes(audio)
    morceaux = audio

    resultat = {
        "voix": tache["voix"],
        "fichier": fichier_audio.name,
        "octets": len(morceaux),
        "mots": len(mots),
        "phrases": len(phrases),
    }

    if veut_reperes and (mots or phrases):
        fichier_reperes = sortie / (tache["fichier"] + ".reperes.json")
        fichier_reperes.write_text(
            json.dumps({"mots": mots, "phrases": phrases}, ensure_ascii=False),
            encoding="utf-8",
        )
        resultat["reperesFichier"] = fichier_reperes.name

    return resultat


async def synthetiser(chemin_travail: str) -> None:
    travail = json.loads(Path(chemin_travail).read_text(encoding="utf-8"))
    sortie = Path(travail["sortie"])
    sortie.mkdir(parents=True, exist_ok=True)
    debit = travail.get("debit", "+0%")

    resultats = []
    for rang, tache in enumerate(travail["taches"]):
        if rang > 0:
            await asyncio.sleep(PAUSE)
        try:
            resultat = await une_tache(tache, sortie, debit)
            resultats.append(resultat)
            print(
                f"  OK     {tache['voix']:<34} "
                f"{resultat['octets'] / 1024:>6.0f} ko   "
                f"{resultat['mots']:>4} reperes",
                file=sys.stderr,
            )
        except Exception as erreur:  # noqa: BLE001 — on rapporte et on continue
            resultats.append({"voix": tache["voix"], "erreur": str(erreur)[:160]})
            print(f"  ECHEC  {tache['voix']:<34} {str(erreur)[:100]}", file=sys.stderr)

    # Le resultat part sur la sortie standard, les traces sur l'erreur standard :
    # Node lit le premier sans avoir a demeler les deux.
    print(json.dumps(resultats, ensure_ascii=False))


def main() -> None:
    # La sortie standard est forcee en UTF-8.
    #
    # Sans cela, Python l'encode sous Windows avec la page de codes de la
    # console — cp1252 ici — ce qui ne se contente pas de mal afficher les
    # accents : il les remplace reellement dans les octets transmis. Le JSON
    # lu par Node serait donc corrompu, et « feminine » arriverait mutile.
    for flux in (sys.stdout, sys.stderr):
        try:
            flux.reconfigure(encoding="utf-8")
        except (AttributeError, ValueError):
            pass

    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        sys.exit(2)

    commande = sys.argv[1]
    if commande == "voix":
        asyncio.run(lister_voix())
    elif commande == "synthese":
        if len(sys.argv) < 3:
            print("synthese attend un fichier de travail.", file=sys.stderr)
            sys.exit(2)
        asyncio.run(synthetiser(sys.argv[2]))
    else:
        print(f"Commande inconnue : {commande}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
