import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { FigmaFile, FigmaNode } from './types';
import {
  getBackgroundColor,
  getBorderColor,
  effectsToBoxShadow,
  typeToCss,
  cssObjectToString,
  cssToTailwind,
  rgbaToHex,
} from './utils';

config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_TOKEN || !FIGMA_FILE_KEY) {
  console.error('❌ Missing FIGMA_TOKEN or FIGMA_FILE_KEY in .env');
  process.exit(1);
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
 * Find node by ID in the document tree
 */
function findNodeById(node: FigmaNode, nodeId: string): FigmaNode | null {
  if (node.id === nodeId) {
    return node;
  }

  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, nodeId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Extract all CSS properties from a Figma node
 */
function extractNodeStyles(node: FigmaNode): Record<string, any> {
  const styles: Record<string, any> = {
    nodeName: node.name,
    nodeType: node.type,
  };

  // Dimensions
  if (node.absoluteBoundingBox) {
    styles.width = `${Math.round(node.absoluteBoundingBox.width)}px`;
    styles.height = `${Math.round(node.absoluteBoundingBox.height)}px`;
  }

  // Background color
  const bgColor = getBackgroundColor(node.fills);
  if (bgColor) {
    styles.backgroundColor = bgColor;
    
    // Also provide hex version
    const solidFill = node.fills?.find(f => f.type === 'SOLID' && f.color);
    if (solidFill && solidFill.color) {
      styles.backgroundColorHex = rgbaToHex(solidFill.color);
    }
  }

  // Border
  const borderColor = getBorderColor(node.strokes);
  if (borderColor) {
    styles.borderColor = borderColor;
    styles.borderWidth = `${node.strokeWeight || 1}px`;
    styles.borderStyle = 'solid';
  }

  // Border radius
  if (node.cornerRadius !== undefined) {
    styles.borderRadius = `${node.cornerRadius}px`;
  }

  // Box shadow
  const boxShadow = effectsToBoxShadow(node.effects);
  if (boxShadow) {
    styles.boxShadow = boxShadow;
  }

  // Opacity
  if (node.opacity !== undefined && node.opacity !== 1) {
    styles.opacity = node.opacity;
  }

  // Typography
  if (node.style) {
    const typeStyles = typeToCss(node.style);
    Object.assign(styles, typeStyles);
    
    // Text content
    if (node.characters) {
      styles.textContent = node.characters;
    }
  }

  // Auto Layout (Flexbox)
  if (node.layoutMode && node.layoutMode !== 'NONE') {
    styles.display = 'flex';
    styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
    
    if (node.itemSpacing) {
      styles.gap = `${node.itemSpacing}px`;
    }
    
    // Padding
    if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
      const pTop = node.paddingTop || 0;
      const pRight = node.paddingRight || 0;
      const pBottom = node.paddingBottom || 0;
      const pLeft = node.paddingLeft || 0;
      
      if (pTop === pRight && pRight === pBottom && pBottom === pLeft) {
        styles.padding = `${pTop}px`;
      } else if (pTop === pBottom && pLeft === pRight) {
        styles.padding = `${pTop}px ${pRight}px`;
      } else {
        styles.padding = `${pTop}px ${pRight}px ${pBottom}px ${pLeft}px`;
      }
    }
  }

  return styles;
}

/**
 * Generate CSS class from node styles
 */
function generateCSS(node: FigmaNode, className: string): string {
  const styles = extractNodeStyles(node);
  
  // Remove metadata
  delete styles.nodeName;
  delete styles.nodeType;
  delete styles.textContent;
  delete styles.backgroundColorHex;
  
  const cssString = cssObjectToString(styles);
  
  return `.${className} {\n${cssString}\n}`;
}

/**
 * Generate HTML from node
 */
function generateHTML(node: FigmaNode, className: string): string {
  const tag = node.type === 'TEXT' ? 'p' : 'div';
  const content = node.characters || '';
  
  let html = `<${tag} class="${className}">`;
  
  if (node.children && node.children.length > 0) {
    html += '\n';
    node.children.forEach((child, index) => {
      const childClass = `${className}__child-${index + 1}`;
      html += `  ${generateHTML(child, childClass).replace(/\n/g, '\n  ')}\n`;
    });
  } else if (content) {
    html += content;
  }
  
  html += `</${tag}>`;
  
  return html;
}

/**
 * Extract component and generate output files
 */
async function extractComponent(nodeId: string) {
  console.log('🔍 Fetching Figma file...');
  const file = await fetchFigmaFile(FIGMA_FILE_KEY!);
  
  console.log('📦 Finding component...');
  const node = findNodeById(file.document, nodeId);
  
  if (!node) {
    throw new Error(`Node with ID "${nodeId}" not found`);
  }
  
  console.log(`✅ Found: ${node.name} (${node.type})`);
  
  // Extract styles
  const styles = extractNodeStyles(node);
  console.log('\n📊 Extracted styles:');
  console.log(JSON.stringify(styles, null, 2));
  
  // Generate CSS
  const className = node.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const css = generateCSS(node, className);
  
  // Generate Tailwind classes
  const tailwindClasses = cssToTailwind(styles);
  
  // Generate HTML
  const html = generateHTML(node, className);
  
  // Create output directory and files
  const outputDir = './output';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Save JSON
  writeFileSync(
    `${outputDir}/${className}-${timestamp}.json`,
    JSON.stringify(styles, null, 2)
  );
  console.log(`\n💾 Saved: ${className}-${timestamp}.json`);
  
  // Save CSS
  writeFileSync(`${outputDir}/${className}-${timestamp}.css`, css);
  console.log(`💾 Saved: ${className}-${timestamp}.css`);
  
  // Save HTML
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${node.name}</title>
  <link rel="stylesheet" href="${className}-${timestamp}.css">
</head>
<body>
  ${html}
</body>
</html>`;
  
  writeFileSync(`${outputDir}/${className}-${timestamp}.html`, fullHTML);
  console.log(`💾 Saved: ${className}-${timestamp}.html`);
  
  // Save Tailwind classes
  const tailwindHTML = `<!-- Tailwind classes for: ${node.name} -->
<div class="${tailwindClasses.join(' ')}">
  ${node.characters || 'Content here'}
</div>`;
  
  writeFileSync(`${outputDir}/${className}-${timestamp}-tailwind.html`, tailwindHTML);
  console.log(`💾 Saved: ${className}-${timestamp}-tailwind.html`);
  
  // Print summary
  console.log('\n📋 Summary:');
  console.log(`   Name: ${node.name}`);
  console.log(`   Type: ${node.type}`);
  console.log(`   CSS properties: ${Object.keys(styles).length}`);
  console.log(`   Tailwind classes: ${tailwindClasses.length}`);
  console.log(`\n✅ Extraction complete!`);
}

// Get node ID from command line or env
const nodeId = process.argv[2] || process.env.FIGMA_NODE_ID;

if (!nodeId) {
  console.error('❌ Please provide a node ID:');
  console.error('   npm run component -- --node-id "123:456"');
  console.error('   or set FIGMA_NODE_ID in .env');
  process.exit(1);
}

// Parse --node-id flag
const nodeIdMatch = process.argv.join(' ').match(/--node-id\s+["']?([^"'\s]+)["']?/);
const finalNodeId = nodeIdMatch ? nodeIdMatch[1] : nodeId;

extractComponent(finalNodeId).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

