#!/bin/bash

# Скрипт для автоматичного оновлення версії Service Worker

# Отримати поточну версію
CURRENT_VERSION=$(grep "const CACHE_VERSION" service-worker.js | sed "s/.*'v\(.*\)'.*/\1/")

echo "📦 Поточна версія: v$CURRENT_VERSION"

# Збільшити версію
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"

# Збільшуємо minor версію
MINOR=$((MINOR + 1))
NEW_VERSION="$MAJOR.$MINOR"

echo "🚀 Нова версія: v$NEW_VERSION"

# Оновити версію в service-worker.js
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/const CACHE_VERSION = 'v[^']*'/const CACHE_VERSION = 'v$NEW_VERSION'/" service-worker.js
else
    # Linux
    sed -i "s/const CACHE_VERSION = 'v[^']*'/const CACHE_VERSION = 'v$NEW_VERSION'/" service-worker.js
fi

echo "✅ Версію оновлено в service-worker.js"

# Оновити версію в version-info.json
CURRENT_DATE=$(date +%Y-%m-%d)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" version-info.json
    sed -i '' "s/\"date\": \"[^\"]*\"/\"date\": \"$CURRENT_DATE\"/" version-info.json
else
    # Linux
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" version-info.json
    sed -i "s/\"date\": \"[^\"]*\"/\"date\": \"$CURRENT_DATE\"/" version-info.json
fi

echo "✅ Версію оновлено в version-info.json"

# Показати зміни
echo ""
echo "📄 Зміни в service-worker.js:"
grep "const CACHE_VERSION" service-worker.js
echo ""
echo "📄 Зміни в version-info.json:"
grep "\"version\":" version-info.json | head -1

echo ""
echo "⚠️  ВАЖЛИВО: Відредагуй version-info.json вручну!"
echo "   Додай опис змін у масив 'changes'"
echo ""
echo "💡 Після редагування version-info.json:"
echo "   git add service-worker.js version-info.json"
echo "   git commit -m \"Оновлено версію PWA до v$NEW_VERSION\""
echo "   git push origin main"
