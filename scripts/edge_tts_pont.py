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
    """Imprime en JSON les voix francaises, telles que le service les declare."""
    toutes = await edge_tts.list_voices()

    francaises = []
    for v in toutes:
        nom_court = v.get("ShortName", "")
        if not nom_court.startswith("fr-"):
            continue
        etiquettes = v.get("VoiceTag", {}) or {}
        francaises.append(
            {
                "id": nom_court,
                "nom": nom_court.split("-")[-1].replace("Neural", ""),
                "locale": v.get("Locale", ""),
                "genre": "féminine" if v.get("Gender") == "Female" else "masculine",
                "personnalites": etiquettes.get("VoicePersonalities", []) or [],
                "scenarios": etiquettes.get("ContentCategories", []) or [],
                "multilingue": "Multilingual" in nom_court,
            }
        )

    francaises.sort(key=lambda x: (x["locale"], x["genre"], x["id"]))
    print(json.dumps(francaises, ensure_ascii=False, indent=1))


async def une_tache(tache: dict, sortie: Path, debit: str) -> dict:
    """Synthetise une tache, ecrit le MP3 et, si demande, les reperes."""
    veut_reperes = bool(tache.get("reperes"))

    parleur = edge_tts.Communicate(
        tache["texte"],
        tache["voix"],
        rate=debit,
        boundary="WordBoundary" if veut_reperes else "SentenceBoundary",
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

    fichier_audio = sortie / (tache["fichier"] + ".mp3")
    fichier_audio.write_bytes(bytes(morceaux))

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
    for tache in travail["taches"]:
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
