# Figma Extractor - Quick Start Guide

## 🚀 Быстрый старт (3 минуты)

### Шаг 1: Получите Personal Access Token

1. Откройте https://www.figma.com/
2. Нажмите на аватар (правый верхний угол) → **Settings**
3. Перейдите в **Account** → **Personal access tokens**
4. Нажмите **Create new token**
5. Дайте имя: `Hummii Extractor`
6. **Скопируйте токен** (показывается только один раз!)

### Шаг 2: Найдите File Key

1. Откройте ваш Figma файл в браузере
2. Скопируйте URL:
```
https://www.figma.com/file/ABC123XYZ456/Design-File-Name
                           ^^^^^^^^^^^^
                           Это File Key
```

### Шаг 3: Настройте проект

```bash
cd scripts/figma-extractor

# Установите зависимости
npm install

# Создайте .env файл
cp .env.example .env

# Отредактируйте .env (вставьте ваш токен и file key)
nano .env
```

### Шаг 4: Запустите извлечение

```bash
# Извлечь ВСЁ из файла (структура, компоненты, список)
npm run extract

# Извлечь все цвета
npm run colors

# Извлечь все шрифты
npm run fonts

# Извлечь конкретный компонент
npm run component -- --node-id "123:456"
```

---

## 📦 Что извлекается БЕСПЛАТНО

### ✅ Цвета
- Background colors (HEX, RGB, RGBA)
- Border colors
- Shadow colors
- Gradient stops
- **Экспорт в:** JSON, CSS variables, SCSS variables, Tailwind config

### ✅ Типографика
- Font family
- Font size
- Font weight (100-900)
- Line height
- Letter spacing
- Text align
- Text transform (uppercase, lowercase, capitalize)
- Text decoration (underline, strikethrough)
- **Экспорт в:** JSON, CSS classes, SCSS mixins, Tailwind config

### ✅ Размеры и позиции
- Width / Height
- Padding (top, right, bottom, left)
- Border radius
- Opacity
- **Экспорт в:** CSS, Tailwind classes

### ✅ Auto Layout (Flexbox)
- Flex direction (row, column)
- Gap / Item spacing
- Align items
- Justify content
- **Экспорт в:** CSS flexbox, Tailwind classes

### ✅ Эффекты
- Drop shadows
- Inner shadows
- Box shadows (offset, blur, spread, color)
- **Экспорт в:** CSS box-shadow

### ✅ Компоненты
- Структура компонентов
- Иерархия элементов
- HTML разметка
- CSS классы
- Tailwind классы

---

## 📖 Как найти Node ID компонента

### Метод 1: Через Figma UI (самый простой)

1. Откройте файл в Figma (десктоп или веб)
2. Выберите компонент/фрейм
3. **Правый клик** → **Copy/Paste as** → **Copy link**
4. Вставьте ссылку:

https://www.figma.com/design/YoYxPiPHPJd3ShahjNT5dD/HUMMII?node-id=144-5&t=LF0vgEuKGsMuDh0n-4

https://www.figma.com/design/fkY34eAJSwkh79ZDsVaK7e/Hummii?node-id=1-256&t=dyRHniwFI65XTEog-0

ID: fkY34eAJSwkh79ZDsVaK7e
NODE ID: 1:256

ID: YoYxPiPHPJd3ShahjNT5dD
NODE ID: 144-5
```
https://www.figma.com/file/ABC123/Design?node-id=123-456
                                                   ^^^^^^^
                                                   Node ID (замените - на :)
```
5. Node ID = `123:456` (замените дефис на двоеточие!)

### Метод 2: Через API (если много компонентов)

```bash
# Извлеките весь файл
npm run extract

# Откройте output/index-*.html в браузере
# Там будет список ВСЕХ компонентов с их ID
```

### Метод 3: Через Dev Tools (для продвинутых)

1. Откройте Figma в браузере
2. Нажмите **F12** (DevTools)
3. Выберите компонент
4. В консоли введите:
```javascript
figma.currentPage.selection[0].id
```

---

## 💡 Примеры использования

### Извлечь Button компонент

```bash
# 1. Найдите Node ID кнопки (см. выше)
# 2. Запустите:
npm run component -- --node-id "123:456"

# 3. Результат в папке output/:
#    - button-2025-11-03.json     (все данные)
#    - button-2025-11-03.css      (CSS стили)
#    - button-2025-11-03.html     (HTML разметка)
#    - button-2025-11-03-tailwind.html (Tailwind классы)
```

### Извлечь все цвета проекта

```bash
npm run colors

# Результат:
#    - colors-*.json              (список всех цветов)
#    - colors-*.css               (CSS variables)
#    - colors-*.scss              (SCSS variables)
#    - tailwind-colors-*.js       (Tailwind config)
```

### Извлечь все шрифты

```bash
npm run fonts

# Результат:
#    - fonts-*.json               (все шрифты)
#    - fonts-*.css                (CSS классы)
#    - fonts-*.scss               (SCSS mixins)
#    - tailwind-fonts-*.js        (Tailwind config)
```

---

## 🎯 Интеграция с вашим проектом

### Импорт цветов в Tailwind CSS

```bash
# 1. Извлеките цвета
npm run colors

# 2. Скопируйте tailwind-colors-*.js
cp output/tailwind-colors-*.js ../../tailwind.config.colors.js

# 3. Импортируйте в tailwind.config.ts
```

```typescript
// tailwind.config.ts
import colors from './tailwind.config.colors.js';

export default {
  theme: {
    extend: {
      colors: colors.theme.extend.colors,
    },
  },
};
```

### Импорт шрифтов в проект

```bash
# 1. Извлеките шрифты
npm run fonts

# 2. Скопируйте CSS классы
cp output/fonts-*.css ../../app/globals.css
```

### Создать React компонент из Figma

```bash
# 1. Извлеките компонент
npm run component -- --node-id "123:456"

# 2. Используйте сгенерированный код
# См. output/button-*.html и output/button-*.css
```

---

## 🔧 Продвинутое использование

### Автоматическая синхронизация

Создайте скрипт для регулярного обновления:

```bash
#!/bin/bash
# sync-figma.sh

cd scripts/figma-extractor

# Извлечь цвета
npm run colors

# Извлечь шрифты
npm run fonts

# Скопировать в проект
cp output/tailwind-colors-*.js ../../tailwind.config.colors.js
cp output/fonts-*.css ../../app/styles/figma-fonts.css

echo "✅ Figma sync complete!"
```

### Интеграция с CI/CD

```yaml
# .github/workflows/sync-figma.yml
name: Sync Figma Design

on:
  schedule:
    - cron: '0 9 * * 1' # Каждый понедельник в 9:00
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd scripts/figma-extractor
          npm install
      
      - name: Sync Figma
        env:
          FIGMA_TOKEN: ${{ secrets.FIGMA_TOKEN }}
          FIGMA_FILE_KEY: ${{ secrets.FIGMA_FILE_KEY }}
        run: |
          cd scripts/figma-extractor
          npm run colors
          npm run fonts
      
      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: sync Figma design tokens'
          branch: figma-sync
```

---

## ❓ Частые вопросы

### Q: Нужна ли платная версия Figma?
**A:** НЕТ! Для REST API достаточно бесплатного аккаунта. Нужен только Personal Access Token.

### Q: Есть ли лимиты на запросы?
**A:** 500 запросов в час. Для большинства случаев более чем достаточно.

### Q: Можно ли извлечь анимации?
**A:** Частично. Можно получить transition параметры, но не keyframe анимации.

### Q: Можно ли извлечь изображения?
**A:** ДА! Используйте Figma Images API (пример в документации).

### Q: Работает ли с Community файлами?
**A:** ДА, если у вас есть доступ к файлу (даже view-only).

---

## 📚 Полезные ссылки

- [Figma REST API Documentation](https://www.figma.com/developers/api)
- [Как получить Personal Access Token](https://help.figma.com/hc/en-us/articles/8085703771159)
- [Figma File Structure](https://www.figma.com/plugin-docs/api/properties/)

---

## 🐛 Troubleshooting

### Ошибка: "Invalid token"
```bash
# Проверьте токен в .env
# Убедитесь, что нет лишних пробелов
FIGMA_TOKEN=figd_YOUR_TOKEN_HERE
```

### Ошибка: "File not found"
```bash
# Проверьте File Key
# Убедитесь, что у вас есть доступ к файлу
```

### Ошибка: "Node not found"
```bash
# Проверьте Node ID
# Используйте двоеточие, а не дефис: 123:456 (не 123-456)
```

---

**Готово! Теперь вы можете БЕСПЛАТНО извлекать ВСЁ из Figma! 🎉**

