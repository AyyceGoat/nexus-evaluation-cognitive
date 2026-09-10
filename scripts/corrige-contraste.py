"""Sur fond `mesure` ou `alerte` plein, le texte doit être noir.

`craie` sur `mesure` donne un contraste de 2,17 (échec), `noir` sur `mesure` donne 8,50.
Ce script corrige les chaînes de classes où les deux cohabitent. Il ne touche pas aux
fonds teintés (`bg-mesure/20`), sur lesquels le texte clair est correct.
"""

import glob
import re

# Chaînes de classes : attribut className="…" et littéraux de chaîne dans les ternaires.
CHAINE = re.compile(r"""(["'`])((?:[^"'`\\]|\\.)*?)\1""", re.S)

PLEIN = re.compile(r"\bbg-(mesure|alerte)\b(?!/)")


def corrige_chaine(contenu: str) -> str:
    if not PLEIN.search(contenu):
        return contenu
    resultat = re.sub(r"\btext-craie\b", "text-noir", contenu)
    resultat = re.sub(r"\btext-brume\b", "text-noir/70", resultat)
    return resultat


def main() -> None:
    files = [
        p for p in glob.glob("src/**/*.tsx", recursive=True)
        if "/data/" not in p.replace("\\", "/")
    ]
    total = 0
    for path in files:
        with open(path, encoding="utf-8") as handle:
            original = handle.read()

        def remplace(match: "re.Match[str]") -> str:
            quote, contenu = match.group(1), match.group(2)
            return quote + corrige_chaine(contenu) + quote

        texte = CHAINE.sub(remplace, original)
        if texte != original:
            with open(path, "w", encoding="utf-8", newline="\n") as handle:
                handle.write(texte)
            total += 1
    print("fichiers corriges :", total)


if __name__ == "__main__":
    main()
