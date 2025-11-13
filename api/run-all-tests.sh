#!/bin/bash

# 🚀 Быстрый Запуск Всех Методов Тестирования API Hummii
# Этот скрипт запустит автотесты, покажет результаты и инструкции для Postman/Swagger

set -e  # Выход при ошибке

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🧪 HUMMII API - КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Проверка текущей директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из директории /root/Garantiny_old/HUMMII/api"
    exit 1
fi

echo "📂 Текущая директория: $(pwd)"
echo ""

# 1. Проверка зависимостей
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1️⃣  ПРОВЕРКА ЗАВИСИМОСТЕЙ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules не найдены. Установка зависимостей..."
    npm install
else
    echo "✅ Зависимости установлены"
fi
echo ""

# 2. Проверка тестовой БД
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  2️⃣  ПРОВЕРКА ТЕСТОВОЙ БД"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker compose -f ../docker-compose.test.yml ps | grep -q "postgres.*Up"; then
    echo "✅ Тестовая БД запущена"
else
    echo "⚠️  Запуск тестовой БД..."
    docker compose -f ../docker-compose.test.yml up -d
    echo "⏳ Ожидание запуска БД (5 секунд)..."
    sleep 5
fi
echo ""

# 3. Запуск Unit тестов
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  3️⃣  ЗАПУСК UNIT ТЕСТОВ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if npm run test:unit; then
    echo ""
    echo "✅ Unit тесты пройдены успешно!"
else
    echo ""
    echo "⚠️  Некоторые unit тесты упали (см. вывод выше)"
fi
echo ""

# 4. Запуск E2E тестов
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  4️⃣  ЗАПУСК E2E ТЕСТОВ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if npm run test:e2e; then
    echo ""
    echo "✅ E2E тесты пройдены успешно!"
else
    echo ""
    echo "⚠️  Некоторые E2E тесты упали (см. вывод выше)"
fi
echo ""

# 5. Генерация отчета покрытия
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  5️⃣  ГЕНЕРАЦИЯ ОТЧЕТА ПОКРЫТИЯ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run test:cov
echo ""

COVERAGE_FILE="coverage/lcov-report/index.html"
if [ -f "$COVERAGE_FILE" ]; then
    echo "✅ Отчет покрытия создан: $COVERAGE_FILE"
    echo ""
    echo "📊 Откройте отчет в браузере:"
    echo "   firefox $COVERAGE_FILE"
    echo "   или"
    echo "   google-chrome $COVERAGE_FILE"
else
    echo "⚠️  Отчет покрытия не создан"
fi
echo ""

# 6. Проверка API сервера
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  6️⃣  ПРОВЕРКА API СЕРВЕРА"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if curl -s http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo "✅ API сервер работает: http://localhost:3000"
    echo ""
    echo "📚 Swagger UI доступен:"
    echo "   http://localhost:3000/api/docs"
else
    echo "⚠️  API сервер не запущен"
    echo ""
    echo "🚀 Запустите API сервер:"
    echo "   cd /root/Garantiny_old/HUMMII"
    echo "   docker compose up -d postgres redis"
    echo "   cd api"
    echo "   npm run start:dev"
    echo ""
    echo "📚 После запуска Swagger UI будет доступен:"
    echo "   http://localhost:3000/api/docs"
fi
echo ""

# 7. Инструкции для Postman
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  7️⃣  ИНСТРУКЦИИ ДЛЯ POSTMAN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📮 Postman коллекция находится:"
echo "   /root/Garantiny_old/HUMMII/docs/postman collection/"
echo ""
echo "📁 Файлы для импорта:"
echo "   1. Hummii-API.postman_collection.json"
echo "   2. Hummii-API-Environment.postman_environment.json"
echo ""
echo "🔧 Как использовать:"
echo "   1. Откройте Postman"
echo "   2. File → Import"
echo "   3. Выберите оба файла выше"
echo "   4. Выберите Environment: 'Hummii API - Local'"
echo "   5. Запустите Collection Runner"
echo ""

# 8. Сводка
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 СВОДКА РЕЗУЛЬТАТОВ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Автотесты выполнены"
echo "📊 Отчет покрытия: coverage/lcov-report/index.html"
echo "📚 Swagger UI: http://localhost:3000/api/docs"
echo "📮 Postman коллекция: docs/postman collection/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📖 ДОПОЛНИТЕЛЬНАЯ ДОКУМЕНТАЦИЯ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📄 TESTING_STRATEGY.md     - Полная стратегия тестирования"
echo "📄 TESTING_COMPARISON.md   - Сравнение методов тестирования"
echo "📄 TEST_README.md          - Подробный гайд по тестам"
echo "📄 README.md               - Основная документация API"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎉 ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
