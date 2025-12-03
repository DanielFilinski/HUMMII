# Новые UI компоненты

Добавлены следующие компоненты в дизайн-систему HUMMII:

## 1. Checkbox (`Checkbox.tsx`)
Компонент чекбокса с кастомным дизайном и галочкой.

**Пропсы:**
- `label?: string` - Текст метки
- `error?: string` - Сообщение об ошибке
- Все стандартные пропсы `input[type="checkbox"]`

**Пример использования:**
```tsx
<Checkbox 
  label="Я согласен с условиями" 
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>
```

## 2. Radio (`Radio.tsx`)
Компонент радио-кнопки с кастомным дизайном.

**Пропсы:**
- `label?: string` - Текст метки
- `error?: string` - Сообщение об ошибке
- Все стандартные пропсы `input[type="radio"]`

**Пример использования:**
```tsx
<Radio 
  label="Вариант 1" 
  name="options"
  value="option1"
  checked={selected === 'option1'}
  onChange={(e) => setSelected(e.target.value)}
/>
```

## 3. Toggle (`Toggle.tsx`)
Компонент переключателя (switch).

**Пропсы:**
- `label?: string` - Текст метки
- `error?: string` - Сообщение об ошибке
- Все стандартные пропсы `input[type="checkbox"]`

**Пример использования:**
```tsx
<Toggle 
  label="Включить уведомления" 
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>
```

## 4. SearchInput (`SearchInput.tsx`)
Поле ввода для поиска с иконкой лупы и кнопкой очистки.

**Пропсы:**
- `label?: string` - Текст метки
- `error?: string` - Сообщение об ошибке
- `hint?: string` - Подсказка
- `fullWidth?: boolean` - Растянуть на всю ширину
- `onClear?: () => void` - Коллбэк для очистки
- Все стандартные пропсы `input[type="search"]`

**Пример использования:**
```tsx
<SearchInput 
  placeholder="Поиск..." 
  value={searchValue}
  onChange={(e) => setSearchValue(e.target.value)}
  onClear={() => setSearchValue('')}
/>
```

## Существующие компоненты

### Textarea
Уже существовал в проекте, поддерживает:
- Счетчик символов (`showCharCount`)
- Ограничение длины (`maxLength`)
- Все стандартные свойства textarea

### Select
Уже существовал в проекте, кастомный dropdown с опциями:
```tsx
<Select 
  label="Выберите категорию"
  options={[
    { value: 'opt1', label: 'Опция 1' },
    { value: 'opt2', label: 'Опция 2' }
  ]}
/>
```

## Обновления страницы Design System

Страница `/[locale]/design-system` была дополнена следующими секциями:

1. **Logo и Header** - Логотип HUMMII с иконкой галочки
2. **Header Variants** - 3 варианта хедера приложения
3. **Extended Button States** - Расширенные состояния кнопок (Default, Hovered, Pressed, Disabled)
4. **Text Area** - Примеры многострочных полей ввода
5. **Checkbox** - Различные состояния чекбоксов
6. **Radio Buttons** - Группа радио-кнопок
7. **Toggle** - Переключатели
8. **Search** - Поле поиска с очисткой
9. **Dropdown** - Выпадающие списки
10. **Categories** - Карточки категорий с иконками
11. **Contractor Cards** - Карточки подрядчиков с аватарами, рейтингами и бейджами
12. **Order Overview** - Карточки заказов в разных состояниях (Активный, Ожидание, Завершен)

## Экспорты

Все новые компоненты добавлены в `/components/ui/index.ts`:

```tsx
export { Checkbox } from './Checkbox';
export { Radio } from './Radio';
export { SearchInput } from './SearchInput';
export { Toggle } from './Toggle';

export type { CheckboxProps } from './Checkbox';
export type { RadioProps } from './Radio';
export type { SearchInputProps } from './SearchInput';
export type { ToggleProps } from './Toggle';
```
