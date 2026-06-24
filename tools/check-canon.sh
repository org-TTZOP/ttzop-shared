#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Зверка канону CLAUDE.md з кодам.
# Выцягвае ўсе `backtick`-ідэнтыфікатары (функцыі/хукі/сцягі) з CLAUDE.md і
# правярае, што кожны існуе ў кодзе. Запускаць ПАСЛЯ кожнага абнаўлення CLAUDE.md
# (правіла «канон ↔ код 1:1»). Флагаваныя = састарэлыя спасылкі АБО дадаць у
# tools/canon-ignore.txt (яўна выдаленыя/легасі, згаданыя ў нататках).
# ─────────────────────────────────────────────────────────────────────────────
set -u
cd "$(dirname "$0")/.." || exit 1

DOC="../CLAUDE.md"
CODE_FILES="admin/index.html assets/js/main.js ../workers.js merge-settings.py .github/workflows/deploy-template.yml"
IGNORE="tools/canon-ignore.txt"

# Токены ў `backticks` → толькі JS-ідэнтыфікатары (camelCase ці _-prefix), даўжыня >3.
# (адсякае мовы/статусы/простыя словы тыпу be, en, root, new, paid, regular)
grep -oE '`[A-Za-z_][A-Za-z0-9_]*`' "$DOC" \
  | tr -d '`' \
  | sort -u \
  | awk 'length>3 && ($0 ~ /[A-Z]/ || $0 ~ /^_/)' > /tmp/canon_tokens.txt

miss=0; total=0; flagged=""
while IFS= read -r tok; do
  [ -z "$tok" ] && continue
  if [ -f "$IGNORE" ] && grep -qxF "$tok" "$IGNORE"; then continue; fi
  total=$((total+1))
  found=0
  for f in $CODE_FILES; do
    [ -f "$f" ] || continue
    if grep -qF "$tok" "$f"; then found=1; break; fi
  done
  if [ "$found" -eq 0 ]; then echo "  ❌ НЕ знойдзена ў кодзе: $tok"; miss=$((miss+1)); flagged="$flagged $tok"; fi
done < /tmp/canon_tokens.txt

echo "─── Зверка канону: $total ідэнтыфікатараў правялі, без адпаведніка: $miss ───"
if [ "$miss" -eq 0 ]; then
  echo "✅ Канон CLAUDE.md адпавядае кода 1:1"
  exit 0
else
  echo "⚠️ Флагаваныя:$flagged"
  echo "   → выправіце назву ў CLAUDE.md, АБО (калі гэта яўна выдаленая/легасі назва ў нататцы) дадайце ў $IGNORE"
  exit 1
fi
