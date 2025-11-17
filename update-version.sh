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

# Показати зміни
echo ""
echo "📄 Зміни в service-worker.js:"
grep "const CACHE_VERSION" service-worker.js

echo ""
echo "💡 Тепер закомітьте зміни:"
echo "   git add service-worker.js"
echo "   git commit -m \"Оновлено версію PWA до v$NEW_VERSION\""
echo "   git push origin main"
