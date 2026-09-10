"""Nettoie les débris laissés par la substitution mécanique des anciennes classes.

Passe unique, idempotente. Ne touche pas aux fichiers de données.
Lancé une fois en Phase 3 ; conservé pour tracer ce qui a été fait.
"""

import glob
import re

SEP = "/"

subs = [
    # Bordure dupliquée laissée par la substitution de .glass / .glass-strong
    (r"bg-graphite border border-ardoise(?:\s+border\s+border-ardoise(?:/\d+)?)+",
     "bg-graphite border border-ardoise"),
    (r"bg-graphite border border-ardoise\s+border-ardoise(?:/\d+)?",
     "bg-graphite border border-ardoise"),
    # Dégradés effondrés sur une seule teinte : remplacés par une couleur plate
    (r"bg-gradient-to-[a-z]{1,2}(?:\s+(?:from|via|to)-[a-z]+(?:/\d+)?)+", "bg-mesure"),
    (r"\s*hover:(?:from|via|to)-[a-z]+(?:/\d+)?", ""),
    (r"\s*(?:from|via|to)-[a-z]+(?:/\d+)?", ""),
    # Ombres : le système n'en a qu'une, réservée au calque de dialogue
    (r"\s*shadow-(?:sm|md|lg|xl|2xl|inner)\b", ""),
    (r"\s*shadow-(?:mesure|alerte|noir|graphite|ardoise|craie|brume)(?:/\d+)?", ""),
    (r"\s*hover:shadow-[a-z0-9/\[\]-]+", ""),
    (r"\s*drop-shadow-[a-z]+", ""),
    # Halos flous et voiles
    (r"\s*blur-(?:sm|md|lg|xl|2xl|3xl)\b", ""),
    (r"\s*backdrop-blur-[a-z0-9]+", ""),
    # Blanc brut vers les tokens
    (r"\btext-white\b", "text-craie"),
    (r"\bbg-white/\[0\.0\d+\]", "bg-ardoise/40"),
    (r"\bbg-white/(?:5|10|20)\b", "bg-ardoise/50"),
    (r"\bbg-black/(?:30|60|70|80|90)\b", "bg-noir/80"),
    (r"\bbg-white\b", "bg-craie"),
    (r"\bborder-white/(?:5|10|20|30)\b", "border-ardoise"),
    (r"\bhover:bg-white/(?:5|10|20)\b", "hover:bg-ardoise"),
    (r"\bplaceholder-brume/\d+\b", "placeholder-brume"),
    (r"\btext-brume/\d+\b", "text-brume"),
    # Boucles décoratives infinies
    (r"\s*animate-pulse\b", ""),
    # Cible de transition explicite plutôt que « tout »
    (r"\btransition-all\b", "transition-colors"),
]


def collapse_spaces(match: "re.Match[str]") -> str:
    inner = re.sub(r"\s+", " ", match.group(1)).strip()
    return 'className="' + inner + '"'


def main() -> None:
    files = [
        p for p in glob.glob("src/**/*.tsx", recursive=True)
        if SEP + "data" + SEP not in p.replace("\\", SEP)
    ]
    changed = 0
    for path in files:
        with open(path, encoding="utf-8") as handle:
            original = handle.read()
        text = original
        for pattern, replacement in subs:
            text = re.sub(pattern, replacement, text)
        text = re.sub(r'className="([^"]*)"', collapse_spaces, text)
        if text != original:
            with open(path, "w", encoding="utf-8", newline="\n") as handle:
                handle.write(text)
            changed += 1
    print("fichiers nettoyes :", changed, "sur", len(files))


if __name__ == "__main__":
    main()
