import json, sys, os

template_path    = sys.argv[1]  # settings-template.json
client_path      = sys.argv[2]  # settings.json кліента
migrations_path  = os.path.join(os.path.dirname(template_path), 'migrations.json')

template = json.load(open(template_path, encoding='utf-8'))
client   = json.load(open(client_path,   encoding='utf-8'))

# -----------------------------------------------
# КРОК 1: Міграцыі — перайменаванне палёў + яўны спіс састарэлых ключоў
# -----------------------------------------------
remove_keys = []
if os.path.exists(migrations_path):
    migrations = json.load(open(migrations_path, encoding='utf-8'))
    rename_rules = migrations.get('rename_rules', {})

    for new_key, old_key in rename_rules.items():
        if old_key in client and new_key not in client:
            client[new_key] = client[old_key]
            del client[old_key]
            print(f'  ~ Мігравана: {old_key} → {new_key}  (значэнне захавана)')

    remove_keys = migrations.get('remove_keys', [])  # ТОЛЬКІ гэтыя ключы выдаляюцца пры дэплоі
else:
    print('  — migrations.json не знойдзены, прапускаем')

# -----------------------------------------------
# КРОК 2: Merge — ДАДАТКОВЫ. Захоўваем УСЕ дадзеныя кліента, дадаём толькі новыя
# дэфолты шаблону. НІКОЛІ не выдаляем ключы кліента аўтаматычна — інакш губляюцца
# дадзеныя, створаныя ў адмінцы (companyTree, contactTree, company і г.д.).
# Выдаляюцца ТОЛЬКІ ключы, яўна пазначаныя ў migrations.json → "remove_keys".
# -----------------------------------------------
merged = dict(client)  # пачынаем з УСІХ дадзеных кліента

added = []
for key in template:
    if key not in merged:
        merged[key] = template[key]
        added.append(key)

removed = []
for key in remove_keys:
    if key in merged:
        del merged[key]
        removed.append(key)

# -----------------------------------------------
# КРОК 3: Захоўваем і паказваем вынік
# -----------------------------------------------
json.dump(merged, open(client_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

if added:
    print('  + Новыя палі дададзены: ' + ', '.join(added))
if removed:
    print('  - Састарэлыя палі выдалены (яўна праз remove_keys): ' + ', '.join(removed))
if not added and not removed:
    print('  — Змен у структуры няма (дадзеныя кліента захаваны цалкам)')
