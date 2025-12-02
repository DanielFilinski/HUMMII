/**
 * Typography Component - Примеры использования
 * 
 * Этот файл содержит примеры использования компонента Typography
 * для различных сценариев в интерфейсе.
 */

import { Typography } from './Typography';

export function TypographyExamples() {
  return (
    <div className="space-y-12 p-8">
      {/* ======================== */}
      {/* ЗАГОЛОВКИ */}
      {/* ======================== */}
      <section className="space-y-6">
        <div className="border-b border-border-primary pb-2">
          <Typography variant="h2" weight="bold">Заголовки</Typography>
        </div>
        
        {/* H1 - Главный заголовок страницы */}
        <div className="space-y-2">
          <Typography variant="bodySm" color="secondary">H1 - Главный заголовок</Typography>
          <Typography variant="h1">
            Найдите лучших специалистов в вашем городе
          </Typography>
          <Typography variant="h1" gradient>
            Заголовок с градиентом
          </Typography>
        </div>
        
        {/* H2 - Подзаголовок секции */}
        <div className="space-y-2">
          <Typography variant="bodySm" color="secondary">H2 - Подзаголовок секции</Typography>
          <Typography variant="h2">
            Популярные категории услуг
          </Typography>
        </div>
        
        {/* H3 - Подзаголовок блока */}
        <div className="space-y-2">
          <Typography variant="bodySm" color="secondary">H3 - Подзаголовок блока</Typography>
          <Typography variant="h3">
            Иван Петров - Сантехник
          </Typography>
        </div>
      </section>

      {/* ======================== */}
      {/* ОСНОВНОЙ ТЕКСТ */}
      {/* ======================== */}
      <section className="space-y-6">
        <div className="border-b border-border-primary pb-2">
          <Typography variant="h2" weight="bold">Основной текст</Typography>
        </div>
        
        {/* Body - Основной текст */}
        <div className="space-y-2">
          <Typography variant="bodySm" color="secondary">Body - Основной текст</Typography>
          <Typography variant="body">
            Это основной текст для описаний, параграфов и основного контента.
            Используется для большинства текстовых блоков в интерфейсе.
          </Typography>
        </div>
        
        {/* Body Small - Мелкий текст */}
        <div className="space-y-2">
          <Typography variant="bodySm" color="secondary">Body Small - Мелкий текст</Typography>
          <Typography variant="bodySm">
            Мелкий текст для дополнительной информации, метаданных и подписей.
          </Typography>
        </div>
        
        {/* Note - Примечания */}
        <div className="space-y-2">
          <Typography variant="bodySm" color="secondary">Note - Примечания</Typography>
          <Typography variant="note" color="tertiary">
            * Примечание: Это дополнительная информация мелким шрифтом
          </Typography>
        </div>
      </section>

      {/* ======================== */}
      {/* ЦВЕТА ТЕКСТА */}
      {/* ======================== */}
      <section className="space-y-6">
        <div className="border-b border-border-primary pb-2">
          <Typography variant="h2" weight="bold">Цвета текста</Typography>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Primary</Typography>
            <Typography variant="body" color="primary">
              Основной текст интерфейса
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Secondary</Typography>
            <Typography variant="body" color="secondary">
              Второстепенный текст
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Tertiary</Typography>
            <Typography variant="body" color="tertiary">
              Неактивный/третичный текст
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Disabled</Typography>
            <Typography variant="body" color="disabled">
              Отключённый текст
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Accent</Typography>
            <Typography variant="body" color="accent">
              Акцентный текст (зелёный)
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Link</Typography>
            <Typography variant="body" color="link" as="a" href="#" className="cursor-pointer">
              Кликабельная ссылка
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Error</Typography>
            <Typography variant="body" color="error">
              Текст ошибки
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Success</Typography>
            <Typography variant="body" color="success">
              Текст успеха
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Warning</Typography>
            <Typography variant="body" color="warning">
              Текст предупреждения
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Info</Typography>
            <Typography variant="body" color="info">
              Информационный текст
            </Typography>
          </div>
        </div>
      </section>

      {/* ======================== */}
      {/* ТЕГИ И МЕТКИ */}
      {/* ======================== */}
      <section className="space-y-6">
        <div className="border-b border-border-primary pb-2">
          <Typography variant="h2" weight="bold">Теги и метки</Typography>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Typography 
            variant="tag" 
            className="px-3 py-1 bg-accent-primary text-text-inverse rounded-full"
          >
            Сантехник
          </Typography>
          <Typography 
            variant="tag" 
            className="px-3 py-1 bg-background-secondary text-accent-primary rounded-full"
          >
            Электрик
          </Typography>
          <Typography 
            variant="tag" 
            className="px-3 py-1 bg-feedback-error/10 text-feedback-error rounded-full"
          >
            Срочно
          </Typography>
          <Typography 
            variant="tag" 
            className="px-3 py-1 bg-feedback-success/10 text-feedback-success rounded-full"
          >
            Доступен
          </Typography>
        </div>
      </section>

      {/* ======================== */}
      {/* ВЫРАВНИВАНИЕ */}
      {/* ======================== */}
      <section className="space-y-6">
        <div className="border-b border-border-primary pb-2">
          <Typography variant="h2" weight="bold">Выравнивание текста</Typography>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-background-secondary rounded-lg">
            <Typography variant="body" align="left">
              Текст выровнен по левому краю (по умолчанию)
            </Typography>
          </div>
          
          <div className="p-4 bg-background-secondary rounded-lg">
            <Typography variant="body" align="center">
              Текст выровнен по центру
            </Typography>
          </div>
          
          <div className="p-4 bg-background-secondary rounded-lg">
            <Typography variant="body" align="right">
              Текст выровнен по правому краю
            </Typography>
          </div>
          
          <div className="p-4 bg-background-secondary rounded-lg">
            <Typography variant="body" align="justify">
              Текст выровнен по ширине. Это означает, что текст растягивается так, чтобы заполнить всю доступную ширину контейнера, создавая ровные края с обеих сторон.
            </Typography>
          </div>
        </div>
      </section>

      {/* ======================== */}
      {/* УСЕЧЕНИЕ ТЕКСТА */}
      {/* ======================== */}
      <section className="space-y-6">
        <div className="border-b border-border-primary pb-2">
          <Typography variant="h2" weight="bold">Усечение текста</Typography>
        </div>
        
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Одна строка с многоточием</Typography>
            <div className="p-4 bg-background-secondary rounded-lg">
              <Typography variant="body" truncate>
                Очень длинный текст который не помещается в одну строку и должен быть усечён с многоточием в конце
              </Typography>
            </div>
          </div>
          
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Две строки с многоточием</Typography>
            <div className="p-4 bg-background-secondary rounded-lg">
              <Typography variant="body" truncate={2}>
                Очень длинный текст который не помещается в две строки и должен быть усечён с многоточием в конце второй строки текста
              </Typography>
            </div>
          </div>
          
          <div className="space-y-2">
            <Typography variant="bodySm" color="secondary">Три строки с многоточием</Typography>
            <div className="p-4 bg-background-secondary rounded-lg">
              <Typography variant="body" truncate={3}>
                Очень длинный текст который не помещается в три строки и должен быть усечён с многоточием в конце третьей строки текста для демонстрации возможностей усечения
              </Typography>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== */}
      {/* ВЕСА ШРИФТОВ */}
      {/* ======================== */}
      <section className="space-y-6">
        <div className="border-b border-border-primary pb-2">
          <Typography variant="h2" weight="bold">Веса шрифтов</Typography>
        </div>
        
        <div className="space-y-2">
          <Typography variant="body" weight="light">
            Light (300) - Лёгкий шрифт
          </Typography>
          <Typography variant="body" weight="regular">
            Regular (400) - Обычный шрифт
          </Typography>
          <Typography variant="body" weight="medium">
            Medium (500) - Средний шрифт
          </Typography>
          <Typography variant="body" weight="semibold">
            Semibold (600) - Полужирный шрифт
          </Typography>
          <Typography variant="body" weight="bold">
            Bold (700) - Жирный шрифт
          </Typography>
          <Typography variant="body" weight="extrabold">
            Extrabold (800) - Очень жирный шрифт
          </Typography>
        </div>
      </section>

      {/* ======================== */}
      {/* РЕАЛЬНЫЕ ПРИМЕРЫ */}
      {/* ======================== */}
      <section className="space-y-6">
        <div className="border-b border-border-primary pb-2">
          <Typography variant="h2" weight="bold">Реальные примеры использования</Typography>
        </div>
        
        {/* Карточка специалиста */}
        <div className="p-6 bg-background-card rounded-lg shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <Typography variant="h3">Иван Петров</Typography>
            <Typography 
              variant="tag" 
              className="px-3 py-1 bg-feedback-success/10 text-feedback-success rounded-full"
            >
              Доступен
            </Typography>
          </div>
          
          <Typography variant="bodySm" color="secondary">
            Сантехник • Стаж 5 лет • ⭐ 4.9 (127 отзывов)
          </Typography>
          
          <Typography variant="body" truncate={2}>
            Профессиональный сантехник с большим опытом работы. 
            Выполняю все виды сантехнических работ: установка, ремонт, замена.
            Работаю быстро и качественно.
          </Typography>
          
          <div className="flex items-center gap-2 pt-2">
            <Typography variant="body" color="accent" weight="semibold">
              от 2000 ₽/час
            </Typography>
            <Typography variant="note" color="tertiary">
              • Минимальный заказ 2 часа
            </Typography>
          </div>
        </div>
        
        {/* Форма с ошибкой */}
        <div className="space-y-2">
          <label htmlFor="email">
            <Typography variant="bodySm" weight="medium">
              Email
            </Typography>
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-2 border border-border-error rounded-lg"
            placeholder="example@email.com"
          />
          <Typography variant="note" color="error">
            Пожалуйста, введите корректный email-адрес
          </Typography>
        </div>
        
        {/* Уведомление */}
        <div className="p-4 bg-feedback-info/10 border-l-4 border-feedback-info rounded">
          <Typography variant="bodySm" color="info" weight="semibold" className="mb-1">
            💡 Совет
          </Typography>
          <Typography variant="bodySm">
            Добавьте фотографии ваших работ, чтобы получать больше заказов
          </Typography>
        </div>
      </section>

      {/* ======================== */}
      {/* АДАПТИВНОСТЬ */}
      {/* ======================== */}
      <section className="space-y-6">
        <div className="border-b border-border-primary pb-2">
          <Typography variant="h2" weight="bold">Адаптивность</Typography>
        </div>
        
        <div className="p-6 bg-background-tertiary rounded-lg space-y-4">
          <Typography variant="bodySm" color="secondary">
            Измените размер окна браузера, чтобы увидеть, как текст адаптируется:
          </Typography>
          
          <div className="space-y-2">
            <Typography variant="h1">
              Заголовок H1
            </Typography>
            <Typography variant="note" color="tertiary">
              Mobile: 28px → Tablet: 30px → Desktop: 36px
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Typography variant="h2">
              Заголовок H2
            </Typography>
            <Typography variant="note" color="tertiary">
              Mobile: 22px → Tablet: 24px → Desktop: 24px
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Typography variant="body">
              Основной текст (Body)
            </Typography>
            <Typography variant="note" color="tertiary">
              Mobile: 16px → Tablet: 18px → Desktop: 20px
            </Typography>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TypographyExamples;
