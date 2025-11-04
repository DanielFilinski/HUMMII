import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { FigmaFile, FigmaNode, RGBA } from './types';
import { rgbaToCss, rgbaToHex } from './utils';

config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_TOKEN || !FIGMA_FILE_KEY) {
  console.error('❌ Missing FIGMA_TOKEN or FIGMA_FILE_KEY in .env');
  process.exit(1);
}

interface ColorInfo {
  name: string;
  hex: string;
  rgb: string;
  rgba: RGBA;
  usage: string[]; // Where this color is used
}

/**
 * Fetch Figma file data
 */
async function fetchFigmaFile(fileKey: string): Promise<FigmaFile> {
  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: {
      'X-FIGMA-TOKEN': FIGMA_TOKEN!,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Figma file: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Extract all colors from the document
 */
function extractColors(node: FigmaNode, colors: Map<string, ColorInfo>, path: string[] = []): void {
  const currentPath = [...path, node.name];
  
  // Extract from fills (backgrounds)
  if (node.fills) {
    node.fills.forEach(fill => {
      if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
        const hex = rgbaToHex(fill.color);
        const rgb = rgbaToCss(fill.color);
        
        if (!colors.has(hex)) {
          colors.set(hex, {
            name: generateColorName(fill.color),
            hex,
            rgb,
            rgba: fill.color,
            usage: [],
          });
        }
        
        colors.get(hex)!.usage.push(`${currentPath.join(' > ')} (background)`);
      }
    });
  }
  
  // Extract from strokes (borders)
  if (node.strokes) {
    node.strokes.forEach(stroke => {
      if (stroke.type === 'SOLID' && stroke.color && stroke.visible !== false) {
        const hex = rgbaToHex(stroke.color);
        const rgb = rgbaToCss(stroke.color);
        
        if (!colors.has(hex)) {
          colors.set(hex, {
            name: generateColorName(stroke.color),
            hex,
            rgb,
            rgba: stroke.color,
            usage: [],
          });
        }
        
        colors.get(hex)!.usage.push(`${currentPath.join(' > ')} (border)`);
      }
    });
  }
  
  // Extract from effects (shadows)
  if (node.effects) {
    node.effects.forEach(effect => {
      if (effect.color && effect.visible !== false) {
        const hex = rgbaToHex(effect.color);
        const rgb = rgbaToCss(effect.color);
        
        if (!colors.has(hex)) {
          colors.set(hex, {
            name: generateColorName(effect.color),
            hex,
            rgb,
            rgba: effect.color,
            usage: [],
          });
        }
        
        colors.get(hex)!.usage.push(`${currentPath.join(' > ')} (shadow)`);
      }
    });
  }
  
  // Recursively process children
  if (node.children) {
    node.children.forEach(child => extractColors(child, colors, currentPath));
  }
}

/**
 * Generate a semantic color name based on HSL values
 */
function generateColorName(color: RGBA): string {
  const r = color.r;
  const g = color.g;
  const b = color.b;
  
  // Convert to HSL to determine hue
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  if (max === min) {
    return l > 0.9 ? 'white' : l < 0.1 ? 'black' : 'gray';
  }
  
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
  let h = 0;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }
  
  h = h * 360;
  
  // Determine color name based on hue
  let colorName = '';
  if (h < 15 || h >= 345) colorName = 'red';
  else if (h < 45) colorName = 'orange';
  else if (h < 75) colorName = 'yellow';
  else if (h < 165) colorName = 'green';
  else if (h < 255) colorName = 'blue';
  else if (h < 285) colorName = 'purple';
  else if (h < 345) colorName = 'pink';
  
  // Add lightness modifier
  if (l > 0.8) colorName = `light-${colorName}`;
  else if (l < 0.3) colorName = `dark-${colorName}`;
  
  // Add saturation modifier
  if (s < 0.2) colorName = colorName.replace(/^(light-|dark-)?/, '$1gray-');
  
  return colorName;
}

/**
 * Generate Tailwind config for colors
 */
function generateTailwindConfig(colors: Map<string, ColorInfo>): string {
  const colorObj: Record<string, string> = {};
  
  colors.forEach((info, hex) => {
    const name = info.name.replace(/-/g, '_');
    colorObj[name] = hex;
  });
  
  return `// Tailwind CSS color configuration
// Generated from Figma design

module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colorObj, null, 8).replace(/"([^"]+)":/g, '$1:')}
    }
  }
};`;
}

/**
 * Generate SCSS variables
 */
function generateSCSSVariables(colors: Map<string, ColorInfo>): string {
  let scss = '// SCSS color variables\n// Generated from Figma design\n\n';
  
  colors.forEach((info) => {
    scss += `$${info.name}: ${info.hex};\n`;
  });
  
  return scss;
}

/**
 * Generate CSS custom properties
 */
function generateCSSVariables(colors: Map<string, ColorInfo>): string {
  let css = '/* CSS custom properties (variables) */\n/* Generated from Figma design */\n\n:root {\n';
  
  colors.forEach((info) => {
    css += `  --color-${info.name}: ${info.hex};\n`;
  });
  
  css += '}\n';
  
  return css;
}

/**
 * Main extraction function
 */
async function extractAllColors() {
  console.log('🔍 Fetching Figma file...');
  const file = await fetchFigmaFile(FIGMA_FILE_KEY!);
  
  console.log('🎨 Extracting colors...');
  const colors = new Map<string, ColorInfo>();
  extractColors(file.document, colors);
  
  console.log(`✅ Found ${colors.size} unique colors\n`);
  
  // Print color list
  console.log('📋 Color list:');
  colors.forEach((info, hex) => {
    console.log(`   ${hex.padEnd(9)} ${info.name.padEnd(20)} (used ${info.usage.length} times)`);
  });
  
  // Create output directory
  const outputDir = './output';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Save JSON
  const colorsArray = Array.from(colors.values());
  writeFileSync(
    `${outputDir}/colors-${timestamp}.json`,
    JSON.stringify(colorsArray, null, 2)
  );
  console.log(`\n💾 Saved: colors-${timestamp}.json`);
  
  // Save Tailwind config
  const tailwindConfig = generateTailwindConfig(colors);
  writeFileSync(`${outputDir}/tailwind-colors-${timestamp}.js`, tailwindConfig);
  console.log(`💾 Saved: tailwind-colors-${timestamp}.js`);
  
  // Save SCSS variables
  const scssVars = generateSCSSVariables(colors);
  writeFileSync(`${outputDir}/colors-${timestamp}.scss`, scssVars);
  console.log(`💾 Saved: colors-${timestamp}.scss`);
  
  // Save CSS variables
  const cssVars = generateCSSVariables(colors);
  writeFileSync(`${outputDir}/colors-${timestamp}.css`, cssVars);
  console.log(`💾 Saved: colors-${timestamp}.css`);
  
  console.log('\n✅ Color extraction complete!');
}

extractAllColors().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

