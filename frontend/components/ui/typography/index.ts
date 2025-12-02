/**
 * Typography System - Public API
 * 
 * Экспортируем все компоненты типографики для удобного импорта
 */

// Основной компонент
export { Typography, type TypographyProps } from './Typography';

// Готовые компоненты-утилиты
export {
  // Заголовки с автоматическими отступами
  Heading1,
  Heading2,
  Heading3,
  
  // Специализированные компоненты
  Prose,          // Текст с ограниченной шириной
  Link,           // Ссылка с hover
  Label,          // Лейбл формы
  ErrorText,      // Текст ошибки
  HelperText,     // Текст-подсказка
  Badge,          // Бейдж/тег
  Price,          // Цена
  Rating,         // Рейтинг
  DateTime,       // Дата/время
  Status,         // Статус (онлайн/оффлайн)
  IconText,       // Текст с иконкой
  EmptyState,     // Пустое состояние
  Counter,        // Счётчик
  Breadcrumbs,    // Хлебные крошки
  
  // Утилиты
  getTypographySize,
  getDefaultWeight,
} from './typography-utils';
