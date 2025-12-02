/**
 * ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ ДИЗАЙН-СИСТЕМЫ
 * 
 * Этот файл содержит практические примеры компонентов,
 * использующих цветовую палитру дизайн-системы.
 */

'use client';

import { ThemeToggle, ThemeSelector, CompactThemeToggle } from '@/components/ThemeToggle';

/**
 * ===================================
 * ПРИМЕРЫ КНОПОК
 * ===================================
 */
export function ButtonExamples() {
  return (
    <div className="space-y-4">
      <h2>Кнопки</h2>
      
      {/* Primary кнопка */}
      <button className="btn-primary">
        Создать заказ
      </button>
      
      {/* Secondary кнопка */}
      <button className="btn-secondary">
        Отменить
      </button>
      
      {/* Disabled кнопка */}
      <button className="btn-primary" disabled>
        Недоступно
      </button>
      
      {/* Кастомная кнопка с цветами из палитры */}
      <button className="bg-accent-primary text-text-inverse px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors">
        Кастомная кнопка
      </button>
    </div>
  );
}

/**
 * ===================================
 * ПРИМЕРЫ КАРТОЧЕК
 * ===================================
 */
export function CardExamples() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Базовая карточка */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-2">Карточка услуги</h3>
        <p className="text-text-secondary mb-4">
          Описание услуги с использованием правильных цветов из палитры.
        </p>
        <span className="badge badge-success">Доступно</span>
      </div>
      
      {/* Карточка с градиентом */}
      <div className="card bg-gradient-card">
        <h3 className="text-xl font-semibold mb-2">Premium услуга</h3>
        <p className="text-text-primary mb-4">
          Карточка с градиентным фоном.
        </p>
        <button className="btn-primary w-full">Выбрать</button>
      </div>
      
      {/* Приподнятая карточка */}
      <div className="bg-surface-elevated border border-border-primary rounded-xl p-6 shadow-elevated">
        <h3 className="text-xl font-semibold mb-2">Elevated Card</h3>
        <p className="text-text-secondary">
          Приподнятая карточка с увеличенной тенью.
        </p>
      </div>
    </div>
  );
}

/**
 * ===================================
 * ПРИМЕРЫ ФОРМ
 * ===================================
 */
export function FormExamples() {
  return (
    <form className="space-y-6 max-w-md">
      {/* Обычный инпут */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Имя
        </label>
        <input
          id="name"
          type="text"
          className="input"
          placeholder="Введите ваше имя"
        />
      </div>
      
      {/* Инпут с ошибкой */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="input input-error"
          placeholder="example@email.com"
        />
        <p className="error-text">Неверный формат email</p>
      </div>
      
      {/* Textarea */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Описание
        </label>
        <textarea
          id="description"
          className="input min-h-[120px]"
          placeholder="Опишите ваш проект"
        />
      </div>
      
      {/* Select */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Категория
        </label>
        <select id="category" className="input">
          <option>Выберите категорию</option>
          <option>Сантехника</option>
          <option>Электрика</option>
          <option>Ремонт</option>
        </select>
      </div>
      
      {/* Кнопка отправки */}
      <button type="submit" className="btn-primary w-full">
        Отправить
      </button>
    </form>
  );
}

/**
 * ===================================
 * ПРИМЕРЫ BADGE
 * ===================================
 */
export function BadgeExamples() {
  return (
    <div className="space-y-4">
      <h2>Badge (статусы)</h2>
      
      <div className="flex flex-wrap gap-2">
        <span className="badge badge-success">Выполнено</span>
        <span className="badge badge-error">Ошибка</span>
        <span className="badge badge-warning">В ожидании</span>
        <span className="badge badge-info">Информация</span>
      </div>
      
      {/* Кастомные badge */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-primary/10 text-accent-primary">
          Новый заказ
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-text-secondary/10 text-text-secondary">
          Черновик
        </span>
      </div>
    </div>
  );
}

/**
 * ===================================
 * ПРИМЕРЫ ПЕРЕКЛЮЧАТЕЛЯ ТЕМЫ
 * ===================================
 */
export function ThemeToggleExamples() {
  return (
    <div className="space-y-6">
      <h2>Переключатели темы</h2>
      
      {/* Простая кнопка */}
      <div>
        <h3 className="text-lg font-medium mb-2">Простая кнопка</h3>
        <ThemeToggle />
      </div>
      
      {/* Расширенный выбор */}
      <div>
        <h3 className="text-lg font-medium mb-2">Расширенный выбор</h3>
        <ThemeSelector />
      </div>
      
      {/* Компактный вариант */}
      <div>
        <h3 className="text-lg font-medium mb-2">Компактный вариант</h3>
        <CompactThemeToggle />
      </div>
    </div>
  );
}

/**
 * ===================================
 * ПРИМЕРЫ УВЕДОМЛЕНИЙ / АЛЕРТОВ
 * ===================================
 */
export function AlertExamples() {
  return (
    <div className="space-y-4">
      <h2>Уведомления / Алерты</h2>
      
      {/* Success */}
      <div className="bg-feedback-success/10 border border-feedback-success/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-feedback-success">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-feedback-success mb-1">Успешно!</h4>
            <p className="text-text-secondary text-sm">Заказ успешно создан</p>
          </div>
        </div>
      </div>
      
      {/* Error */}
      <div className="bg-feedback-error/10 border border-feedback-error/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-feedback-error">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-feedback-error mb-1">Ошибка</h4>
            <p className="text-text-secondary text-sm">Не удалось сохранить данные</p>
          </div>
        </div>
      </div>
      
      {/* Warning */}
      <div className="bg-feedback-warning/10 border border-feedback-warning/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-feedback-warning">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-feedback-warning mb-1">Внимание</h4>
            <p className="text-text-secondary text-sm">Проверьте введённые данные</p>
          </div>
        </div>
      </div>
      
      {/* Info */}
      <div className="bg-feedback-info/10 border border-feedback-info/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-feedback-info">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-feedback-info mb-1">Информация</h4>
            <p className="text-text-secondary text-sm">Обновление будет доступно через 2 часа</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ===================================
 * ПРИМЕРЫ МОДАЛЬНЫХ ОКОН
 * ===================================
 */
export function ModalExample() {
  return (
    <>
      {/* Оверлей */}
      <div className="fixed inset-0 bg-background-overlay backdrop-blur-sm z-50 flex items-center justify-center">
        {/* Модальное окно */}
        <div className="bg-background-card border border-border-primary rounded-xl shadow-elevated max-w-md w-full mx-4 p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-semibold">Подтверждение</h2>
            <button className="text-text-secondary hover:text-text-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-text-secondary mb-6">
            Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.
          </p>
          
          <div className="flex gap-3">
            <button className="btn-secondary flex-1">
              Отменить
            </button>
            <button className="btn-primary flex-1 bg-feedback-error hover:bg-feedback-error/90">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * ===================================
 * ПРИМЕРЫ НАВИГАЦИИ
 * ===================================
 */
export function NavigationExample() {
  return (
    <nav className="bg-background-card border-b border-border-primary">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-primary rounded-lg flex items-center justify-center text-text-inverse font-bold">
              H
            </div>
            <span className="text-xl font-bold text-gradient">HUMMII</span>
          </div>
          
          {/* Навигационные ссылки */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-text-primary hover:text-accent-primary transition-colors">
              Главная
            </a>
            <a href="#" className="text-text-secondary hover:text-accent-primary transition-colors">
              Услуги
            </a>
            <a href="#" className="text-text-secondary hover:text-accent-primary transition-colors">
              О нас
            </a>
            <a href="#" className="text-text-secondary hover:text-accent-primary transition-colors">
              Контакты
            </a>
          </div>
          
          {/* Действия */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="btn-primary">
              Войти
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * ===================================
 * ПОЛНЫЙ ПРИМЕР СТРАНИЦЫ
 * ===================================
 */
export default function DesignSystemShowcase() {
  return (
    <div className="min-h-screen bg-background theme-transition">
      <NavigationExample />
      
      <main className="container mx-auto px-4 py-12 space-y-16">
        <section>
          <h1 className="mb-8">Дизайн-система HUMMII</h1>
          <p className="text-text-secondary max-w-2xl">
            Примеры использования компонентов с правильными цветами из палитры.
            Переключите тему, чтобы увидеть, как адаптируются цвета.
          </p>
        </section>
        
        <ThemeToggleExamples />
        <ButtonExamples />
        <CardExamples />
        <FormExamples />
        <BadgeExamples />
        <AlertExamples />
      </main>
      
      <footer className="bg-background-secondary border-t border-border-primary py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-text-secondary">
          <p>© 2025 HUMMII. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
