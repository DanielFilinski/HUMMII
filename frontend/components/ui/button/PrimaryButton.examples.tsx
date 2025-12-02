/**
 * PRIMARY BUTTON - ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
 * 
 * Демонстрация всех состояний и вариантов использования PrimaryButton
 */

import React from 'react';
import { PrimaryButton } from './PrimaryButton';

export function PrimaryButtonExamples() {
  return (
    <div className="space-y-6 p-8 bg-background">
      <div className="space-y-3">
        <h2 className="text-desktop-h2 text-text-primary mb-4">
          Primary Button - Все состояния
        </h2>
        
        {/* Default State */}
        <div className="space-y-2">
          <p className="text-desktop-body-sm text-text-secondary">1. Default State</p>
          <PrimaryButton>View all services</PrimaryButton>
        </div>

        {/* Hover State */}
        <div className="space-y-2">
          <p className="text-desktop-body-sm text-text-secondary">2. Hover State (наведите мышь)</p>
          <PrimaryButton>View all services</PrimaryButton>
        </div>

        {/* Pressed State */}
        <div className="space-y-2">
          <p className="text-desktop-body-sm text-text-secondary">3. Pressed State (удерживайте клик)</p>
          <PrimaryButton>View all services</PrimaryButton>
        </div>

        {/* Loading State */}
        <div className="space-y-2">
          <p className="text-desktop-body-sm text-text-secondary">4. Loading State</p>
          <PrimaryButton isLoading>View all services</PrimaryButton>
        </div>

        {/* Disabled State */}
        <div className="space-y-2">
          <p className="text-desktop-body-sm text-text-secondary">5. Disabled State</p>
          <PrimaryButton disabled>View all services</PrimaryButton>
        </div>
      </div>

      {/* Full Width Example */}
      <div className="space-y-3">
        <h3 className="text-desktop-h3 text-text-primary">Full Width Button</h3>
        <PrimaryButton fullWidth>View all services</PrimaryButton>
      </div>

      {/* Click Handler Example */}
      <div className="space-y-3">
        <h3 className="text-desktop-h3 text-text-primary">With Click Handler</h3>
        <PrimaryButton onClick={() => alert('Button clicked!')}>
          Click me
        </PrimaryButton>
      </div>

      {/* In Form Example */}
      <div className="space-y-3">
        <h3 className="text-desktop-h3 text-text-primary">In Form (Submit Button)</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Form submitted!');
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Enter text..."
            className="w-full px-4 py-2 border border-border-primary rounded-lg"
          />
          <PrimaryButton type="submit" fullWidth>
            Submit Form
          </PrimaryButton>
        </form>
      </div>

      {/* Comparison: Light vs Dark Theme */}
      <div className="space-y-3">
        <h3 className="text-desktop-h3 text-text-primary">Theme Comparison</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Light Theme */}
          <div className="p-6 bg-background-primary rounded-lg border border-border-primary">
            <p className="text-sm text-text-secondary mb-3">Light Theme</p>
            <PrimaryButton>View all services</PrimaryButton>
          </div>
          
          {/* Dark Theme */}
          <div className="dark p-6 bg-background-primary rounded-lg border border-border-primary">
            <p className="text-sm text-text-secondary mb-3">Dark Theme</p>
            <PrimaryButton>View all services</PrimaryButton>
          </div>
        </div>
      </div>

      {/* Async Action Example */}
      <div className="space-y-3">
        <h3 className="text-desktop-h3 text-text-primary">Async Action (Loading Simulation)</h3>
        <AsyncButtonExample />
      </div>
    </div>
  );
}

/**
 * Пример с асинхронным действием и состоянием загрузки
 */
function AsyncButtonExample() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAsyncAction = async () => {
    setIsLoading(true);
    
    // Симуляция API запроса
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    alert('Action completed!');
  };

  return (
    <PrimaryButton isLoading={isLoading} onClick={handleAsyncAction}>
      {isLoading ? 'Loading...' : 'Start Async Action'}
    </PrimaryButton>
  );
}

// Для использования в сторибуке или документации
export default PrimaryButtonExamples;
