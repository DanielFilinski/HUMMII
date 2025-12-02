/**
 * PRIMARY BUTTON DEMO PAGE
 * 
 * Демонстрационная страница для тестирования PrimaryButton компонента
 * 
 * Путь: /demo/primary-button
 */

'use client';

import { useState } from 'react';
import { PrimaryButton } from '@/components/ui/button';

export default function PrimaryButtonDemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleAsyncAction = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setClickCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-desktop-h1 text-text-primary font-bold">
            Primary Button Demo
          </h1>
          <p className="text-desktop-body text-text-secondary">
            Тестирование всех состояний основной кнопки Hummii
          </p>
        </div>

        {/* All States */}
        <section className="space-y-6">
          <h2 className="text-desktop-h2 text-text-primary font-semibold">
            Все состояния
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default */}
            <div className="p-6 bg-background-card rounded-xl border border-border-primary space-y-3">
              <h3 className="text-desktop-h3 text-text-primary">1. Default</h3>
              <p className="text-desktop-body-sm text-text-secondary">
                Базовое состояние
              </p>
              <PrimaryButton>View all services</PrimaryButton>
            </div>

            {/* Hover */}
            <div className="p-6 bg-background-card rounded-xl border border-border-primary space-y-3">
              <h3 className="text-desktop-h3 text-text-primary">2. Hover</h3>
              <p className="text-desktop-body-sm text-text-secondary">
                Наведите курсор
              </p>
              <PrimaryButton>View all services</PrimaryButton>
            </div>

            {/* Pressed */}
            <div className="p-6 bg-background-card rounded-xl border border-border-primary space-y-3">
              <h3 className="text-desktop-h3 text-text-primary">3. Pressed</h3>
              <p className="text-desktop-body-sm text-text-secondary">
                Удерживайте клик
              </p>
              <PrimaryButton>View all services</PrimaryButton>
            </div>

            {/* Loading */}
            <div className="p-6 bg-background-card rounded-xl border border-border-primary space-y-3">
              <h3 className="text-desktop-h3 text-text-primary">4. Loading</h3>
              <p className="text-desktop-body-sm text-text-secondary">
                С индикатором загрузки
              </p>
              <PrimaryButton isLoading>View all services</PrimaryButton>
            </div>

            {/* Disabled */}
            <div className="p-6 bg-background-card rounded-xl border border-border-primary space-y-3">
              <h3 className="text-desktop-h3 text-text-primary">5. Disabled</h3>
              <p className="text-desktop-body-sm text-text-secondary">
                Неактивное состояние
              </p>
              <PrimaryButton disabled>View all services</PrimaryButton>
            </div>

            {/* Interactive Loading */}
            <div className="p-6 bg-background-card rounded-xl border border-border-primary space-y-3">
              <h3 className="text-desktop-h3 text-text-primary">Interactive</h3>
              <p className="text-desktop-body-sm text-text-secondary">
                Clicks: {clickCount}
              </p>
              <PrimaryButton isLoading={isLoading} onClick={handleAsyncAction}>
                {isLoading ? 'Loading...' : 'Click Me'}
              </PrimaryButton>
            </div>
          </div>
        </section>

        {/* Width Variants */}
        <section className="space-y-6">
          <h2 className="text-desktop-h2 text-text-primary font-semibold">
            Варианты ширины
          </h2>
          
          <div className="space-y-4">
            <div className="p-6 bg-background-card rounded-xl border border-border-primary space-y-3">
              <h3 className="text-desktop-h3 text-text-primary">Default Width</h3>
              <PrimaryButton>View all services</PrimaryButton>
            </div>

            <div className="p-6 bg-background-card rounded-xl border border-border-primary space-y-3">
              <h3 className="text-desktop-h3 text-text-primary">Full Width</h3>
              <PrimaryButton fullWidth>View all services</PrimaryButton>
            </div>
          </div>
        </section>

        {/* Form Example */}
        <section className="space-y-6">
          <h2 className="text-desktop-h2 text-text-primary font-semibold">
            В форме
          </h2>
          
          <div className="p-6 bg-background-card rounded-xl border border-border-primary">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Form submitted!');
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-desktop-body-sm text-text-primary">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 rounded-lg border border-border-primary bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-desktop-body-sm text-text-primary">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Your message..."
                  className="w-full px-4 py-2 rounded-lg border border-border-primary bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
                />
              </div>

              <PrimaryButton type="submit" fullWidth>
                Submit Form
              </PrimaryButton>
            </form>
          </div>
        </section>

        {/* Theme Comparison */}
        <section className="space-y-6">
          <h2 className="text-desktop-h2 text-text-primary font-semibold">
            Сравнение тем
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Light Theme */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 space-y-4">
              <h3 className="text-desktop-h3 font-medium text-gray-900">
                Light Theme
              </h3>
              <div className="space-y-3">
                <PrimaryButton>Default</PrimaryButton>
                <PrimaryButton isLoading>Loading</PrimaryButton>
                <PrimaryButton disabled>Disabled</PrimaryButton>
              </div>
            </div>

            {/* Dark Theme */}
            <div className="dark p-6 bg-[#0F1419] rounded-xl border border-gray-700 space-y-4">
              <h3 className="text-desktop-h3 font-medium text-gray-100">
                Dark Theme
              </h3>
              <div className="space-y-3">
                <PrimaryButton>Default</PrimaryButton>
                <PrimaryButton isLoading>Loading</PrimaryButton>
                <PrimaryButton disabled>Disabled</PrimaryButton>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Code */}
        <section className="space-y-6">
          <h2 className="text-desktop-h2 text-text-primary font-semibold">
            Примеры кода
          </h2>
          
          <div className="space-y-4">
            <CodeBlock
              title="Базовое использование"
              code={`import { PrimaryButton } from '@/components/ui/button';

<PrimaryButton>
  View all services
</PrimaryButton>`}
            />

            <CodeBlock
              title="С состоянием загрузки"
              code={`const [isLoading, setIsLoading] = useState(false);

<PrimaryButton isLoading={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</PrimaryButton>`}
            />

            <CodeBlock
              title="Full Width в форме"
              code={`<form onSubmit={handleSubmit}>
  <input type="email" required />
  <PrimaryButton type="submit" fullWidth>
    Submit
  </PrimaryButton>
</form>`}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * Code Block Component
 */
function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="bg-background-card rounded-xl border border-border-primary overflow-hidden">
      <div className="px-4 py-2 bg-background-secondary border-b border-border-primary">
        <p className="text-desktop-body-sm text-text-primary font-medium">
          {title}
        </p>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-text-secondary font-mono">{code}</code>
      </pre>
    </div>
  );
}
