# 🔄 Миграция на новый Typography компонент

Руководство по переходу с прямых HTML-элементов и Tailwind-классов на компонент Typography.

---

## 📋 План миграции

1. ✅ Определить все места использования текста
2. ✅ Заменить HTML-элементы на Typography
3. ✅ Заменить прямые Tailwind-классы на пропсы компонента
4. ✅ Тестировать адаптивность
5. ✅ Проверить темы (светлая/тёмная)

---

## 🔀 Примеры замен

### Заголовки

#### До (старый код)
```tsx
<h1 className="text-3xl font-bold text-gray-900 mb-4">
  Найдите лучших специалистов
</h1>

<h2 className="text-2xl font-semibold text-gray-800">
  Популярные категории
</h2>

<h3 className="text-xl font-medium text-gray-700">
  Иван Петров
</h3>
```

#### После (новый код)
```tsx
<Typography variant="h1" className="mb-4">
  Найдите лучших специалистов
</Typography>

<Typography variant="h2">
  Популярные категории
</Typography>

<Typography variant="h3">
  Иван Петров
</Typography>
```

**Преимущества:**
- ✅ Автоматическая адаптивность (28-36px для h1)
- ✅ Правильные веса шрифтов (bold для h1)
- ✅ Поддержка тем (цвета меняются автоматически)

---

### Основной текст

#### До
```tsx
<p className="text-base text-gray-600 leading-relaxed">
  Это основной текст описания услуги.
</p>

<p className="text-sm text-gray-500">
  Дополнительная информация мелким шрифтом.
</p>
```

#### После
```tsx
<Typography variant="body">
  Это основной текст описания услуги.
</Typography>

<Typography variant="bodySm" color="secondary">
  Дополнительная информация мелким шрифтом.
</Typography>
```

---

### Цвета текста

#### До
```tsx
<p className="text-gray-900">Основной текст</p>
<p className="text-gray-600">Второстепенный текст</p>
<p className="text-gray-400">Неактивный текст</p>
<p className="text-green-600">Акцентный текст</p>
<p className="text-red-600">Ошибка</p>
<p className="text-white">Белый текст</p>
```

#### После
```tsx
<Typography color="primary">Основной текст</Typography>
<Typography color="secondary">Второстепенный текст</Typography>
<Typography color="tertiary">Неактивный текст</Typography>
<Typography color="accent">Акцентный текст</Typography>
<Typography color="error">Ошибка</Typography>
<Typography color="inverse">Белый текст</Typography>
```

---

### Ссылки

#### До
```tsx
<a 
  href="/profile" 
  className="text-green-600 hover:text-green-700 hover:underline transition-colors"
>
  Перейти в профиль
</a>
```

#### После
```tsx
<Typography as="a" href="/profile" color="link">
  Перейти в профиль
</Typography>

// Или используйте готовый компонент
<Link href="/profile">Перейти в профиль</Link>
```

---

### Теги/Badge

#### До
```tsx
<span className="px-3 py-1 text-sm font-bold bg-green-100 text-green-800 rounded-full">
  Сантехник
</span>

<span className="px-3 py-1 text-sm font-bold bg-red-100 text-red-800 rounded-full">
  Срочно
</span>
```

#### После
```tsx
<Typography 
  variant="tag" 
  className="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full"
>
  Сантехник
</Typography>

// Или используйте готовый компонент Badge
<Badge variant="success">Сантехник</Badge>
<Badge variant="error">Срочно</Badge>
```

---

### Усечение текста

#### До
```tsx
<p className="text-base line-clamp-2">
  Очень длинный текст который нужно усечь до двух строк с многоточием в конце
</p>

<p className="text-base truncate">
  Очень длинный текст в одну строку
</p>
```

#### После
```tsx
<Typography variant="body" truncate={2}>
  Очень длинный текст который нужно усечь до двух строк с многоточием в конце
</Typography>

<Typography variant="body" truncate>
  Очень длинный текст в одну строку
</Typography>
```

---

### Выравнивание

#### До
```tsx
<p className="text-center text-base">По центру</p>
<p className="text-right text-base">По правому краю</p>
<p className="text-justify text-base">По ширине</p>
```

#### После
```tsx
<Typography align="center">По центру</Typography>
<Typography align="right">По правому краю</Typography>
<Typography align="justify">По ширине</Typography>
```

---

### Веса шрифтов

#### До
```tsx
<p className="text-base font-light">Лёгкий</p>
<p className="text-base font-normal">Обычный</p>
<p className="text-base font-medium">Средний</p>
<p className="text-base font-semibold">Полужирный</p>
<p className="text-base font-bold">Жирный</p>
<p className="text-base font-extrabold">Очень жирный</p>
```

#### После
```tsx
<Typography weight="light">Лёгкий</Typography>
<Typography weight="regular">Обычный</Typography>
<Typography weight="medium">Средний</Typography>
<Typography weight="semibold">Полужирный</Typography>
<Typography weight="bold">Жирный</Typography>
<Typography weight="extrabold">Очень жирный</Typography>
```

---

### Адаптивная типографика

#### До (вручную добавлены responsive-классы)
```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Заголовок
</h1>

<p className="text-sm sm:text-base lg:text-lg">
  Текст
</p>
```

#### После (автоматическая адаптивность)
```tsx
<Typography variant="h1">
  Заголовок
</Typography>

<Typography variant="body">
  Текст
</Typography>
```

**Преимущества:**
- ✅ Не нужно вручную добавлять responsive-классы
- ✅ Единообразные размеры во всём проекте
- ✅ Легко изменить размеры глобально в одном месте

---

## 📦 Примеры реальной миграции

### Пример 1: Карточка специалиста

#### До
```tsx
<div className="p-6 bg-white rounded-lg shadow-md">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-xl font-medium text-gray-900">Иван Петров</h3>
    <span className="px-3 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full">
      Доступен
    </span>
  </div>
  
  <p className="text-sm text-gray-600 mb-3">
    Сантехник • Стаж 5 лет • ⭐ 4.9 (127 отзывов)
  </p>
  
  <p className="text-base text-gray-700 line-clamp-2 mb-3">
    Профессиональный сантехник с большим опытом работы. 
    Выполняю все виды сантехнических работ: установка, ремонт, замена.
  </p>
  
  <div className="flex items-center gap-2">
    <span className="text-lg font-semibold text-green-600">от 2000 ₽/час</span>
    <span className="text-xs text-gray-500">• Минимальный заказ 2 часа</span>
  </div>
</div>
```

#### После
```tsx
<div className="p-6 bg-background-card rounded-lg shadow-card">
  <div className="flex items-center justify-between mb-3">
    <Typography variant="h3">Иван Петров</Typography>
    <Badge variant="success">Доступен</Badge>
  </div>
  
  <Typography variant="bodySm" color="secondary" className="mb-3">
    Сантехник • Стаж 5 лет • ⭐ 4.9 (127 отзывов)
  </Typography>
  
  <Typography variant="body" truncate={2} className="mb-3">
    Профессиональный сантехник с большим опытом работы. 
    Выполняю все виды сантехнических работ: установка, ремонт, замена.
  </Typography>
  
  <div className="flex items-center gap-2">
    <Price>2000</Price>
    <Typography variant="note" color="tertiary">
      • Минимальный заказ 2 часа
    </Typography>
  </div>
</div>
```

---

### Пример 2: Форма

#### До
```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
      Email
    </label>
    <input 
      id="email" 
      type="email" 
      className="w-full px-4 py-2 border border-red-500 rounded-lg"
    />
    <p className="text-xs text-red-600">
      Пожалуйста, введите корректный email-адрес
    </p>
  </div>
  
  <div className="space-y-2">
    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
      Пароль
    </label>
    <input 
      id="password" 
      type="password" 
      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
    />
    <p className="text-xs text-gray-500">
      Минимум 8 символов, включая буквы и цифры
    </p>
  </div>
</div>
```

#### После
```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <input 
      id="email" 
      type="email" 
      className="w-full px-4 py-2 border border-border-error rounded-lg"
    />
    <ErrorText>Пожалуйста, введите корректный email-адрес</ErrorText>
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="password">Пароль</Label>
    <input 
      id="password" 
      type="password" 
      className="w-full px-4 py-2 border border-border-primary rounded-lg"
    />
    <HelperText>Минимум 8 символов, включая буквы и цифры</HelperText>
  </div>
</div>
```

---

### Пример 3: Hero-секция

#### До
```tsx
<section className="text-center py-16 bg-gradient-to-br from-green-50 to-blue-50">
  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
    Найдите лучших специалистов
  </h1>
  <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
    Hummii соединяет вас с проверенными профессионалами для любых задач
  </p>
  <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
    Начать поиск
  </button>
</section>
```

#### После
```tsx
<section className="text-center py-16 bg-gradient-main">
  <Typography variant="h1" gradient className="mb-4">
    Найдите лучших специалистов
  </Typography>
  <Typography variant="body" color="secondary" className="max-w-2xl mx-auto mb-8">
    Hummii соединяет вас с проверенными профессионалами для любых задач
  </Typography>
  <button className="btn-primary">
    Начать поиск
  </button>
</section>
```

---

## 🔍 Поиск мест для миграции

Используйте поиск в коде для нахождения мест, требующих миграции:

### Поиск HTML-заголовков
```bash
grep -r "<h1" src/
grep -r "<h2" src/
grep -r "<h3" src/
```

### Поиск параграфов с Tailwind-классами
```bash
grep -r "className.*text-" src/
grep -r "className.*font-" src/
```

### Поиск прямых цветов
```bash
grep -r "text-gray-" src/
grep -r "text-green-" src/
grep -r "text-red-" src/
```

---

## ✅ Чек-лист миграции

### Перед началом
- [ ] Прочитать [TYPOGRAPHY_GUIDE.md](./TYPOGRAPHY_GUIDE.md)
- [ ] Изучить [примеры](./Typography.examples.tsx)
- [ ] Создать резервную копию изменяемых файлов

### Процесс миграции
- [ ] Найти все заголовки (h1, h2, h3) и заменить на Typography
- [ ] Найти все параграфы (p) с классами и заменить на Typography
- [ ] Заменить прямые цвета (text-gray-*, text-green-*) на семантические (color="primary")
- [ ] Убрать responsive-классы (sm:, md:, lg:) где используется Typography
- [ ] Заменить line-clamp-* на truncate prop
- [ ] Заменить inline styles на пропсы компонента

### Тестирование
- [ ] Проверить на desktop (≥1024px)
- [ ] Проверить на tablet (768-1023px)
- [ ] Проверить на mobile (<768px)
- [ ] Проверить светлую тему
- [ ] Проверить тёмную тему
- [ ] Проверить усечение текста
- [ ] Проверить ссылки и hover-эффекты

### Финализация
- [ ] Убрать неиспользуемые Tailwind-классы
- [ ] Обновить импорты компонентов
- [ ] Проверить accessibility (aria-labels, semantic HTML)
- [ ] Обновить тесты (если есть)
- [ ] Обновить документацию компонентов (если нужно)

---

## 🚨 Частые ошибки

### ❌ Ошибка 1: Прямые цвета
```tsx
// НЕПРАВИЛЬНО
<Typography style={{ color: '#2A2A0F' }}>Текст</Typography>

// ПРАВИЛЬНО
<Typography color="primary">Текст</Typography>
```

### ❌ Ошибка 2: Дублирование responsive-классов
```tsx
// НЕПРАВИЛЬНО (размеры дублируются)
<Typography variant="h1" className="text-2xl md:text-3xl lg:text-4xl">
  Заголовок
</Typography>

// ПРАВИЛЬНО (автоматическая адаптивность)
<Typography variant="h1">
  Заголовок
</Typography>
```

### ❌ Ошибка 3: Неправильный HTML-элемент
```tsx
// НЕПРАВИЛЬНО (div вместо h1 плохо для SEO)
<Typography as="div" variant="h1">Заголовок</Typography>

// ПРАВИЛЬНО (автоматически выбирается <h1>)
<Typography variant="h1">Заголовок</Typography>
```

### ❌ Ошибка 4: Забыли про accessibility
```tsx
// НЕПРАВИЛЬНО (нет htmlFor)
<Typography variant="bodySm">Email</Typography>
<input id="email" />

// ПРАВИЛЬНО (связь лейбла с инпутом)
<Label htmlFor="email">Email</Label>
<input id="email" />
```

---

## 📊 Прогресс миграции

Отслеживайте прогресс миграции по файлам:

```
□ app/page.tsx
□ app/about/page.tsx
□ components/Header.tsx
□ components/Footer.tsx
□ components/UserCard.tsx
...
```

---

## 💡 Советы

1. **Мигрируйте постепенно** - начните с одной страницы или компонента
2. **Тестируйте после каждого изменения** - не накапливайте изменения
3. **Используйте готовые компоненты** - Badge, Label, ErrorText и т.д.
4. **Не бойтесь рефакторинга** - новый компонент делает код чище
5. **Документируйте изменения** - оставляйте комментарии для команды

---

## 📚 Дополнительные ресурсы

- **[Typography Guide](./TYPOGRAPHY_GUIDE.md)** - Полное руководство
- **[Cheatsheet](./TYPOGRAPHY_CHEATSHEET.md)** - Быстрая справка
- **[Examples](./Typography.examples.tsx)** - Интерактивные примеры
- **[Design System](../../DESIGN_SYSTEM.md)** - Общая дизайн-система

---

**Удачной миграции! 🚀**
