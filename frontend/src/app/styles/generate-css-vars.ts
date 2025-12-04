#!/usr/bin/env tsx
/**
 * ГЕНЕРАТОР CSS-ПЕРЕМЕННЫХ ИЗ DESIGN TOKENS
 * 
 * Этот скрипт автоматически генерирует CSS-переменные из design-tokens.ts
 * Запускается автоматически перед dev/build или вручную: npm run generate:css
 * 
 * ВАЖНО: Не редактируйте вручную CSS-переменные в generated-vars.css!
 */

import * as fs from 'fs';
import * as path from 'path';
import { lightPalette, darkPalette, extendedShadows } from '../../shared/lib/design-tokens';

/**
 * Конвертирует camelCase в kebab-case
 */
function toKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Рекурсивно генерирует CSS-переменные из объекта
 */
function generateCSSVars(obj: Record<string, any>, prefix: string = ''): string[] {
  const vars: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    let varName: string;
    
    // Специальная обработка для градиентов
    if (key === 'gradient') {
      varName = prefix ? `${prefix.replace('--color-background-', '--')}` : '--gradient';
    } else {
      varName = prefix ? `${prefix}-${toKebabCase(key)}` : `--color-${toKebabCase(key)}`;
    }
    
    if (typeof value === 'object' && !Array.isArray(value) && value !== null && key !== 'gradient') {
      // Рекурсивно обрабатываем вложенные объекты
      vars.push(...generateCSSVars(value, varName));
    } else if (typeof value === 'object' && key === 'gradient') {
      // Обработка градиентов
      for (const [gradKey, gradValue] of Object.entries(value)) {
        vars.push(`  --gradient-${toKebabCase(gradKey)}: ${gradValue};`);
      }
    } else if (typeof value === 'string') {
      vars.push(`  ${varName}: ${value};`);
    }
  }
  
  return vars;
}

/**
 * Генерирует переменные теней
 */
function generateShadowVars(): string[] {
  const vars: string[] = [];
  
  for (const [key, value] of Object.entries(extendedShadows)) {
    vars.push(`  --shadow-${toKebabCase(key)}: ${value};`);
  }
  
  return vars;
}

/**
 * Основная функция генерации
 */
function generateCSSFile(): void {
  const lightVars = generateCSSVars(lightPalette);
  const darkVars = generateCSSVars(darkPalette);
  const shadowVars = generateShadowVars();
  
  const css = `/**
 * АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЕ CSS-ПЕРЕМЕННЫЕ
 * 
 * ⚠️ НЕ РЕДАКТИРУЙТЕ ЭТОТ ФАЙЛ ВРУЧНУЮ! ⚠️
 * 
 * Этот файл генерируется автоматически из design-tokens.ts
 * Запустите: npm run generate:css для обновления
 * 
 * Источник: src/shared/lib/design-tokens.ts
 * Генератор: scripts/generate-css-vars.ts
 */

/**
 * ===================================
 * СВЕТЛАЯ ТЕМА (по умолчанию)
 * ===================================
 */
:root {
${lightVars.join('\n')}
  
  /* Тени */
${shadowVars.join('\n')}
}

/**
 * ===================================
 * ТЁМНАЯ ТЕМА
 * ===================================
 */
.dark {
${darkVars.join('\n')}
  
  /* Тени (переопределяются для тёмной темы) */
  --shadow-card: 0px 2px 8px rgba(0, 0, 0, 0.5);
  --shadow-elevated: 0px 4px 16px rgba(0, 0, 0, 0.6);
  --shadow-focus: 0 0 0 3px rgba(103, 173, 81, 0.4);
}
`;
  
  // Сохраняем в файл
  const outputPath = path.join(__dirname, '../app/generated-vars.css');
  fs.writeFileSync(outputPath, css, 'utf-8');
  
  console.log('✅ CSS-переменные успешно сгенерированы!');
  console.log(`📄 Файл: ${outputPath}`);
  console.log(`📊 Переменных (светлая тема): ${lightVars.length}`);
  console.log(`📊 Переменных (тёмная тема): ${darkVars.length}`);
  console.log(`📊 Теней: ${shadowVars.length}`);
}

// Запуск
try {
  generateCSSFile();
} catch (error) {
  console.error('❌ Ошибка генерации CSS-переменных:', error);
  process.exit(1);
}
