import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { FigmaFile, FigmaNode, TypeStyle } from './types';
import { typeToCss, cssObjectToString } from './utils';

config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_TOKEN || !FIGMA_FILE_KEY) {
  console.error('❌ Missing FIGMA_TOKEN or FIGMA_FILE_KEY in .env');
  process.exit(1);
}

interface FontInfo {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign?: string;
  textTransform?: string;
  textDecoration?: string;
  fontStyle?: string;
  usage: string[]; // Where this font style is used
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
 * Create a unique key for a font style
 */
function createFontKey(style: TypeStyle): string {
  return `${style.fontFamily}|${style.fontSize}|${style.fontWeight}|${style.lineHeightPx}|${style.letterSpacing}`;
}

/**
 * Generate a semantic name for a font style
 */
function generateFontName(style: TypeStyle): string {
  const family = style.fontFamily.toLowerCase().replace(/\s+/g, '-');
  const weight = style.fontWeight;
  const size = Math.round(style.fontSize);
  
  // Determine style category based on size
  let category = '';
  if (size >= 48) category = 'heading-xl';
  else if (size >= 36) category = 'heading-lg';
  else if (size >= 24) category = 'heading-md';
  else if (size >= 20) category = 'heading-sm';
  else if (size >= 16) category = 'body-lg';
  else if (size >= 14) category = 'body-md';
  else if (size >= 12) category = 'body-sm';
  else category = 'body-xs';
  
  return `${category}-${weight}`;
}

/**
 * Extract all font styles from the document
 */
function extractFonts(node: FigmaNode, fonts: Map<string, FontInfo>, path: string[] = []): void {
  const currentPath = [...path, node.name];
  
  if (node.style && node.type === 'TEXT') {
    const key = createFontKey(node.style);
    
    if (!fonts.has(key)) {
      fonts.set(key, {
        fontFamily: node.style.fontFamily,
        fontSize: node.style.fontSize,
        fontWeight: node.style.fontWeight,
        lineHeight: node.style.lineHeightPx,
        letterSpacing: node.style.letterSpacing,
        textAlign: node.style.textAlignHorizontal !== 'LEFT' ? node.style.textAlignHorizontal.toLowerCase() : undefined,
        textTransform: node.style.textCase && node.style.textCase !== 'ORIGINAL' ? node.style.textCase.toLowerCase() : undefined,
        textDecoration: node.style.textDecoration && node.style.textDecoration !== 'NONE' ? node.style.textDecoration.toLowerCase() : undefined,
        fontStyle: node.style.italic ? 'italic' : undefined,
        usage: [],
      });
    }
    
    fonts.get(key)!.usage.push(currentPath.join(' > '));
  }
  
  // Recursively process children
  if (node.children) {
    node.children.forEach(child => extractFonts(child, fonts, currentPath));
  }
}

/**
 * Generate Tailwind typography config
 */
function generateTailwindTypography(fonts: Map<string, FontInfo>): string {
  const fontObj: Record<string, any> = {};
  
  let index = 1;
  fonts.forEach((info, key) => {
    const style = info.usage[0]?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `style-${index++}`;
    
    fontObj[style] = {
      fontFamily: info.fontFamily,
      fontSize: `${info.fontSize}px`,
      fontWeight: info.fontWeight,
      lineHeight: `${info.lineHeight}px`,
      letterSpacing: info.letterSpacing !== 0 ? `${info.letterSpacing}px` : undefined,
    };
    
    // Remove undefined values
    Object.keys(fontObj[style]).forEach(key => {
      if (fontObj[style][key] === undefined) {
        delete fontObj[style][key];
      }
    });
  });
  
  return `// Tailwind CSS typography configuration
// Generated from Figma design

module.exports = {
  theme: {
    extend: {
      typography: ${JSON.stringify(fontObj, null, 8).replace(/"([^"]+)":/g, '$1:')}
    }
  }
};`;
}

/**
 * Generate SCSS mixins for fonts
 */
function generateSCSSMixins(fonts: Map<string, FontInfo>): string {
  let scss = '// SCSS typography mixins\n// Generated from Figma design\n\n';
  
  let index = 1;
  fonts.forEach((info, key) => {
    const mixinName = generateFontName({ 
      fontFamily: info.fontFamily,
      fontSize: info.fontSize,
      fontWeight: info.fontWeight,
      lineHeightPx: info.lineHeight,
      letterSpacing: info.letterSpacing,
    } as TypeStyle);
    
    scss += `@mixin ${mixinName} {\n`;
    scss += `  font-family: "${info.fontFamily}";\n`;
    scss += `  font-size: ${info.fontSize}px;\n`;
    scss += `  font-weight: ${info.fontWeight};\n`;
    scss += `  line-height: ${info.lineHeight}px;\n`;
    
    if (info.letterSpacing !== 0) {
      scss += `  letter-spacing: ${info.letterSpacing}px;\n`;
    }
    if (info.textAlign) {
      scss += `  text-align: ${info.textAlign};\n`;
    }
    if (info.textTransform) {
      scss += `  text-transform: ${info.textTransform};\n`;
    }
    if (info.textDecoration) {
      scss += `  text-decoration: ${info.textDecoration};\n`;
    }
    if (info.fontStyle) {
      scss += `  font-style: ${info.fontStyle};\n`;
    }
    
    scss += `}\n\n`;
    index++;
  });
  
  return scss;
}

/**
 * Generate CSS classes for fonts
 */
function generateCSSClasses(fonts: Map<string, FontInfo>): string {
  let css = '/* CSS typography classes */\n/* Generated from Figma design */\n\n';
  
  let index = 1;
  fonts.forEach((info, key) => {
    const className = generateFontName({
      fontFamily: info.fontFamily,
      fontSize: info.fontSize,
      fontWeight: info.fontWeight,
      lineHeightPx: info.lineHeight,
      letterSpacing: info.letterSpacing,
    } as TypeStyle);
    
    css += `.${className} {\n`;
    css += `  font-family: "${info.fontFamily}";\n`;
    css += `  font-size: ${info.fontSize}px;\n`;
    css += `  font-weight: ${info.fontWeight};\n`;
    css += `  line-height: ${info.lineHeight}px;\n`;
    
    if (info.letterSpacing !== 0) {
      css += `  letter-spacing: ${info.letterSpacing}px;\n`;
    }
    if (info.textAlign) {
      css += `  text-align: ${info.textAlign};\n`;
    }
    if (info.textTransform) {
      css += `  text-transform: ${info.textTransform};\n`;
    }
    if (info.textDecoration) {
      css += `  text-decoration: ${info.textDecoration};\n`;
    }
    if (info.fontStyle) {
      css += `  font-style: ${info.fontStyle};\n`;
    }
    
    css += `}\n\n`;
    index++;
  });
  
  return css;
}

/**
 * Main extraction function
 */
async function extractAllFonts() {
  console.log('🔍 Fetching Figma file...');
  const file = await fetchFigmaFile(FIGMA_FILE_KEY!);
  
  console.log('🔤 Extracting fonts...');
  const fonts = new Map<string, FontInfo>();
  extractFonts(file.document, fonts);
  
  console.log(`✅ Found ${fonts.size} unique font styles\n`);
  
  // Print font list
  console.log('📋 Font styles:');
  fonts.forEach((info, key) => {
    const name = generateFontName({
      fontFamily: info.fontFamily,
      fontSize: info.fontSize,
      fontWeight: info.fontWeight,
      lineHeightPx: info.lineHeight,
      letterSpacing: info.letterSpacing,
    } as TypeStyle);
    
    console.log(`   ${name.padEnd(25)} ${info.fontFamily} ${info.fontSize}px/${info.lineHeight}px (weight: ${info.fontWeight}) - used ${info.usage.length} times`);
  });
  
  // Create output directory
  const outputDir = './output';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Save JSON
  const fontsArray = Array.from(fonts.values());
  writeFileSync(
    `${outputDir}/fonts-${timestamp}.json`,
    JSON.stringify(fontsArray, null, 2)
  );
  console.log(`\n💾 Saved: fonts-${timestamp}.json`);
  
  // Save Tailwind config
  const tailwindConfig = generateTailwindTypography(fonts);
  writeFileSync(`${outputDir}/tailwind-fonts-${timestamp}.js`, tailwindConfig);
  console.log(`💾 Saved: tailwind-fonts-${timestamp}.js`);
  
  // Save SCSS mixins
  const scssMixins = generateSCSSMixins(fonts);
  writeFileSync(`${outputDir}/fonts-${timestamp}.scss`, scssMixins);
  console.log(`💾 Saved: fonts-${timestamp}.scss`);
  
  // Save CSS classes
  const cssClasses = generateCSSClasses(fonts);
  writeFileSync(`${outputDir}/fonts-${timestamp}.css`, cssClasses);
  console.log(`💾 Saved: fonts-${timestamp}.css`);
  
  console.log('\n✅ Font extraction complete!');
}

extractAllFonts().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

