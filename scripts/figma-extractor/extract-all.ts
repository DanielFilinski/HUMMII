import { config } from 'dotenv';
import { writeFileSync, mkdirSync } from 'fs';
import { FigmaFile, FigmaNode } from './types';
import {
  getBackgroundColor,
  getBorderColor,
  effectsToBoxShadow,
  typeToCss,
} from './utils';

config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_TOKEN || !FIGMA_FILE_KEY) {
  console.error('❌ Missing FIGMA_TOKEN or FIGMA_FILE_KEY in .env');
  process.exit(1);
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
  }

  // Auto Layout (Flexbox)
  if (node.layoutMode && node.layoutMode !== 'NONE') {
    styles.display = 'flex';
    styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
    
    if (node.itemSpacing) {
      styles.gap = `${node.itemSpacing}px`;
    }
  }

  return styles;
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
 * Extract all components and frames
 */
function extractAllComponents(node: FigmaNode, components: any[] = [], depth = 0): any[] {
  const isComponent = ['COMPONENT', 'COMPONENT_SET', 'FRAME', 'GROUP'].includes(node.type);
  
  if (isComponent && depth > 0) {
    const styles = extractNodeStyles(node);
    
    components.push({
      id: node.id,
      name: node.name,
      type: node.type,
      depth,
      styles,
      childrenCount: node.children?.length || 0,
    });
  }
  
  // Recursively process children
  if (node.children) {
    node.children.forEach(child => extractAllComponents(child, components, depth + 1));
  }
  
  return components;
}

/**
 * Create a tree structure for better visualization
 */
function createTree(node: FigmaNode, depth = 0): string {
  const indent = '  '.repeat(depth);
  const icon = node.children && node.children.length > 0 ? '📦' : '📄';
  const type = node.type.toLowerCase();
  
  let tree = `${indent}${icon} ${node.name} (${type})\n`;
  
  if (node.children) {
    node.children.forEach(child => {
      tree += createTree(child, depth + 1);
    });
  }
  
  return tree;
}

/**
 * Main extraction function
 */
async function extractAll() {
  console.log('🔍 Fetching Figma file...');
  const file = await fetchFigmaFile(FIGMA_FILE_KEY!);
  
  console.log(`✅ File: ${file.name}`);
  console.log(`   Version: ${file.version}`);
  console.log(`   Last modified: ${new Date(file.lastModified).toLocaleString()}`);
  
  console.log('\n📊 Extracting all components...');
  const components = extractAllComponents(file.document);
  
  console.log(`✅ Found ${components.length} components/frames\n`);
  
  // Print component list
  console.log('📋 Components:');
  components.slice(0, 20).forEach((comp, index) => {
    const indent = '  '.repeat(comp.depth - 1);
    console.log(`   ${indent}${index + 1}. ${comp.name} (${comp.type.toLowerCase()}) - ID: ${comp.id}`);
  });
  
  if (components.length > 20) {
    console.log(`   ... and ${components.length - 20} more`);
  }
  
  // Create tree structure
  console.log('\n🌲 Document tree:');
  const tree = createTree(file.document);
  console.log(tree.split('\n').slice(0, 30).join('\n'));
  if (tree.split('\n').length > 30) {
    console.log('   ... (truncated)');
  }
  
  // Create output directory
  const outputDir = './output';
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch (e) {
    // Directory already exists
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Save full file data
  writeFileSync(
    `${outputDir}/figma-full-${timestamp}.json`,
    JSON.stringify(file, null, 2)
  );
  console.log(`\n💾 Saved: figma-full-${timestamp}.json`);
  
  // Save component list
  writeFileSync(
    `${outputDir}/components-${timestamp}.json`,
    JSON.stringify(components, null, 2)
  );
  console.log(`💾 Saved: components-${timestamp}.json`);
  
  // Save tree structure
  writeFileSync(
    `${outputDir}/tree-${timestamp}.txt`,
    tree
  );
  console.log(`💾 Saved: tree-${timestamp}.txt`);
  
  // Create index HTML with component links
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file.name} - Figma Export</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #f5f5f5;
    }
    h1 { color: #333; }
    .component {
      background: white;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .component h3 {
      margin: 0 0 0.5rem 0;
      color: #0066cc;
    }
    .meta {
      color: #666;
      font-size: 0.9rem;
    }
    .styles {
      background: #f9f9f9;
      padding: 0.5rem;
      border-radius: 4px;
      margin-top: 0.5rem;
      font-family: monospace;
      font-size: 0.85rem;
      overflow-x: auto;
    }
    .command {
      background: #2d2d2d;
      color: #00ff00;
      padding: 1rem;
      border-radius: 4px;
      font-family: monospace;
      margin: 1rem 0;
    }
  </style>
</head>
<body>
  <h1>📦 ${file.name}</h1>
  <p class="meta">
    Last modified: ${new Date(file.lastModified).toLocaleString()}<br>
    Version: ${file.version}<br>
    Total components: ${components.length}
  </p>
  
  <div class="command">
    💡 To extract a specific component, run:<br>
    <code>npm run component -- --node-id "NODE_ID"</code>
  </div>
  
  <h2>Components & Frames</h2>
`;
  
  components.forEach((comp, index) => {
    const indent = '  '.repeat(comp.depth - 1);
    html += `
  <div class="component">
    <h3>${indent}${comp.name}</h3>
    <p class="meta">
      Type: ${comp.type} | ID: <code>${comp.id}</code> | Children: ${comp.childrenCount}
    </p>
    <details>
      <summary>View extracted styles</summary>
      <div class="styles">
        ${JSON.stringify(comp.styles, null, 2).replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>
    </details>
  </div>`;
  });
  
  html += `
</body>
</html>`;
  
  writeFileSync(`${outputDir}/index-${timestamp}.html`, html);
  console.log(`💾 Saved: index-${timestamp}.html`);
  
  console.log('\n✅ Full extraction complete!');
  console.log('\n📖 Next steps:');
  console.log('   1. Open index-*.html in your browser to view all components');
  console.log('   2. Copy a component ID and run:');
  console.log('      npm run component -- --node-id "COMPONENT_ID"');
  console.log('   3. Or extract colors: npm run colors');
  console.log('   4. Or extract fonts: npm run fonts');
}

extractAll().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

