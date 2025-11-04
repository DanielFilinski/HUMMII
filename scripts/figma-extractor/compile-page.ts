import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Script to compile Figma extracted files into a single viewable HTML page
 */

interface CompileOptions {
  inputDir: string;
  outputFile: string;
  componentName?: string;
  inlineStyles?: boolean;
}

/**
 * Find the latest extracted files for a component
 */
function findLatestFiles(dir: string, componentName?: string): {
  html?: string;
  css?: string;
  tailwind?: string;
  json?: string;
} {
  const files = readdirSync(dir);
  
  const pattern = componentName || '';
  
  // Find latest files by timestamp
  const htmlFiles = files
    .filter(f => f.includes(pattern) && f.endsWith('.html') && !f.includes('tailwind') && !f.includes('index'))
    .sort()
    .reverse();
  
  const cssFiles = files
    .filter(f => f.includes(pattern) && f.endsWith('.css') && !f.includes('colors') && !f.includes('fonts'))
    .sort()
    .reverse();
  
  const tailwindFiles = files
    .filter(f => f.includes(pattern) && f.includes('tailwind') && f.endsWith('.html'))
    .sort()
    .reverse();
  
  const jsonFiles = files
    .filter(f => f.includes(pattern) && f.endsWith('.json') && !f.includes('colors') && !f.includes('fonts') && !f.includes('components') && !f.includes('figma-full'))
    .sort()
    .reverse();
  
  return {
    html: htmlFiles[0] ? join(dir, htmlFiles[0]) : undefined,
    css: cssFiles[0] ? join(dir, cssFiles[0]) : undefined,
    tailwind: tailwindFiles[0] ? join(dir, tailwindFiles[0]) : undefined,
    json: jsonFiles[0] ? join(dir, jsonFiles[0]) : undefined,
  };
}

/**
 * Extract body content from HTML
 */
function extractBodyContent(html: string): string {
  const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
  if (bodyMatch) {
    return bodyMatch[1].trim();
  }
  return html;
}

/**
 * Generate reset and base styles
 */
function generateBaseStyles(): string {
  return `
/* CSS Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  padding: 20px;
}

/* Main container */
.figma-container {
  background: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  max-width: 1920px;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 1920px) {
  .figma-container {
    max-width: 100%;
  }
}

/* Info panel */
.info-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.info-panel h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.info-panel p {
  font-size: 14px;
  opacity: 0.9;
}

.info-panel .meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 12px;
  font-size: 13px;
}

.info-panel .meta span {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
}

/* Content wrapper */
.content-wrapper {
  padding: 0;
}
`;
}

/**
 * Compile Figma page
 */
function compileFigmaPage(options: CompileOptions): void {
  const { inputDir, outputFile, componentName, inlineStyles = true } = options;
  
  console.log('🔍 Searching for files...');
  const files = findLatestFiles(inputDir, componentName);
  
  if (!files.html) {
    throw new Error(`No HTML file found for component: ${componentName || 'any'}`);
  }
  
  console.log('📦 Found files:');
  console.log(`   HTML: ${files.html}`);
  console.log(`   CSS: ${files.css || 'none'}`);
  console.log(`   JSON: ${files.json || 'none'}`);
  
  // Read files
  const htmlContent = readFileSync(files.html, 'utf-8');
  const cssContent = files.css ? readFileSync(files.css, 'utf-8') : '';
  
  // Load metadata
  let metadata: any = {};
  if (files.json) {
    metadata = JSON.parse(readFileSync(files.json, 'utf-8'));
  }
  
  // Extract body content
  const bodyContent = extractBodyContent(htmlContent);
  
  // Get component name from metadata or filename
  const displayName = metadata.nodeName || componentName || 'Figma Component';
  const componentType = metadata.nodeType || 'FRAME';
  const dimensions = metadata.width && metadata.height 
    ? `${metadata.width} × ${metadata.height}` 
    : 'Unknown';
  
  // Combine styles
  const baseStyles = generateBaseStyles();
  const componentStyles = cssContent;
  
  // Generate HTML
  const compiledHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Compiled Figma design preview">
  <title>${displayName} - Figma Preview</title>
  
  <style>
${baseStyles}

/* Component Styles */
${componentStyles}
  </style>
</head>
<body>
  <!-- Info Panel -->
  <div class="info-panel">
    <h1>📐 ${displayName}</h1>
    <p>Compiled from Figma design</p>
    <div class="meta">
      <span>Type: ${componentType}</span>
      <span>Size: ${dimensions}</span>
      <span>Generated: ${new Date().toLocaleString()}</span>
    </div>
  </div>

  <!-- Figma Container -->
  <div class="figma-container">
    <div class="content-wrapper">
${bodyContent}
    </div>
  </div>

  <script>
    // Log component info
    console.log('📦 Figma Component Loaded');
    console.log('Name:', '${displayName}');
    console.log('Type:', '${componentType}');
    console.log('Dimensions:', '${dimensions}');
    console.log('Metadata:', ${JSON.stringify(metadata, null, 2)});
    
    // Add click handlers for interactive preview
    document.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Link clicked:', link.href || link.textContent);
        alert('This is a static preview. Link: ' + (link.href || link.textContent));
      });
    });
    
    // Highlight elements on hover (debug mode)
    if (window.location.search.includes('debug=true')) {
      document.querySelectorAll('div, section, article, header, footer, nav').forEach(el => {
        el.addEventListener('mouseenter', function() {
          this.style.outline = '2px solid red';
        });
        el.addEventListener('mouseleave', function() {
          this.style.outline = '';
        });
      });
      console.log('🐛 Debug mode enabled. Hover over elements to highlight them.');
    }
  </script>
</body>
</html>`;
  
  // Ensure output directory exists
  const outputDir = join(inputDir, 'compiled');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = join(outputDir, outputFile);
  
  // Write compiled file
  writeFileSync(outputPath, compiledHtml, 'utf-8');
  
  console.log('\n✅ Compilation complete!');
  console.log(`📄 Output: ${outputPath}`);
  console.log(`📏 Size: ${(compiledHtml.length / 1024).toFixed(2)} KB`);
  console.log('\n💡 Open in browser:');
  console.log(`   file://${outputPath}`);
  console.log('\n🐛 Debug mode:');
  console.log(`   file://${outputPath}?debug=true`);
}

// CLI Usage
const args = process.argv.slice(2);
const componentName = args.find(arg => arg.startsWith('--component='))?.split('=')[1];
const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'index.html';
const inputDir = args.find(arg => arg.startsWith('--input='))?.split('=')[1] || './output';

try {
  compileFigmaPage({
    inputDir,
    outputFile,
    componentName,
    inlineStyles: true,
  });
} catch (error) {
  console.error('❌ Error:', (error as Error).message);
  console.error('\nUsage:');
  console.error('  tsx compile-page.ts [options]');
  console.error('\nOptions:');
  console.error('  --component=<name>   Component name to compile (e.g., "1280-1920")');
  console.error('  --output=<filename>  Output filename (default: index.html)');
  console.error('  --input=<dir>        Input directory (default: ./output)');
  console.error('\nExample:');
  console.error('  tsx compile-page.ts --component=1280-1920 --output=main-page.html');
  process.exit(1);
}




