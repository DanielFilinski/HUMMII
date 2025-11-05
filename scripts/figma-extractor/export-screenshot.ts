import { config } from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { FigmaFile } from './types';

config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_TOKEN || !FIGMA_FILE_KEY) {
  console.error('❌ Missing FIGMA_TOKEN or FIGMA_FILE_KEY in .env');
  process.exit(1);
}

/**
 * Fetch Figma file
 */
async function fetchFigmaFile(fileKey: string): Promise<FigmaFile> {
  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: { 'X-FIGMA-TOKEN': FIGMA_TOKEN! },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Figma file: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Export node as image
 */
async function exportNodeAsImage(
  fileKey: string,
  nodeId: string,
  format: 'png' | 'jpg' | 'svg' = 'png',
  scale: number = 2
): Promise<string> {
  const response = await fetch(
    `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=${format}&scale=${scale}`,
    {
      headers: { 'X-FIGMA-TOKEN': FIGMA_TOKEN! },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to export image: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.err) {
    throw new Error(`Figma API error: ${data.err}`);
  }

  const imageUrl = data.images[nodeId];
  
  if (!imageUrl) {
    throw new Error(`No image URL returned for node ${nodeId}`);
  }

  return imageUrl;
}

/**
 * Download image from URL
 */
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate HTML page with embedded image
 */
async function exportFigmaPageAsImage(nodeId: string, outputFile: string): Promise<void> {
  console.log('🔍 Fetching Figma file...');
  const file = await fetchFigmaFile(FIGMA_FILE_KEY!);
  
  console.log('🖼️  Exporting node as image...');
  const imageUrl = await exportNodeAsImage(FIGMA_FILE_KEY!, nodeId, 'png', 2);
  
  console.log('⬇️  Downloading image...');
  const imageBuffer = await downloadImage(imageUrl);
  
  // Convert to base64
  const base64Image = imageBuffer.toString('base64');
  
  // Create output directory
  const outputDir = './output/screenshots';
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  // Save raw image
  const imagePath = join(outputDir, `${outputFile.replace('.html', '')}.png`);
  writeFileSync(imagePath, imageBuffer);
  console.log(`💾 Saved image: ${imagePath}`);
  
  // Generate HTML with embedded image
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Figma Design Preview - ${nodeId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f5f5f5;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .header p {
      font-size: 14px;
      opacity: 0.9;
    }

    .controls {
      background: white;
      padding: 15px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      flex-wrap: wrap;
    }

    .controls button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .controls button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .btn-zoom-in {
      background: #4CAF50;
      color: white;
    }

    .btn-zoom-out {
      background: #FF9800;
      color: white;
    }

    .btn-reset {
      background: #2196F3;
      color: white;
    }

    .btn-fullscreen {
      background: #9C27B0;
      color: white;
    }

    .zoom-level {
      font-size: 14px;
      font-weight: 600;
      color: #666;
    }

    .container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 20px;
      overflow: auto;
    }

    .image-wrapper {
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    img {
      display: block;
      max-width: 100%;
      height: auto;
      transition: transform 0.3s ease;
    }

    .fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      cursor: zoom-out;
    }

    .fullscreen img {
      max-width: 95vw;
      max-height: 95vh;
      object-fit: contain;
    }

    .footer {
      background: #2f3236;
      color: white;
      padding: 15px 20px;
      text-align: center;
      font-size: 13px;
    }

    .footer a {
      color: #64B5F6;
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📐 Figma Design Preview</h1>
    <p>High-quality screenshot from Figma (2x resolution)</p>
  </div>

  <div class="controls">
    <button class="btn-zoom-in" onclick="zoomIn()">🔍 Zoom In</button>
    <button class="btn-zoom-out" onclick="zoomOut()">🔎 Zoom Out</button>
    <button class="btn-reset" onclick="resetZoom()">↺ Reset</button>
    <button class="btn-fullscreen" onclick="toggleFullscreen()">⛶ Fullscreen</button>
    <span class="zoom-level">Zoom: <span id="zoom-display">100%</span></span>
  </div>

  <div class="container" id="container">
    <div class="image-wrapper">
      <img 
        id="design-image" 
        src="data:image/png;base64,${base64Image}" 
        alt="Figma Design"
        onclick="toggleFullscreen()"
        style="cursor: zoom-in;"
      />
    </div>
  </div>

  <div class="footer">
    📄 Node ID: <strong>${nodeId}</strong> | 
    🎨 Exported from <a href="https://www.figma.com/file/${FIGMA_FILE_KEY}" target="_blank">Figma</a> | 
    📅 Generated: ${new Date().toLocaleString()}
  </div>

  <script>
    let currentZoom = 1;
    const img = document.getElementById('design-image');
    const zoomDisplay = document.getElementById('zoom-display');
    const container = document.getElementById('container');

    function updateZoom() {
      img.style.transform = \`scale(\${currentZoom})\`;
      zoomDisplay.textContent = Math.round(currentZoom * 100) + '%';
    }

    function zoomIn() {
      if (currentZoom < 3) {
        currentZoom += 0.1;
        updateZoom();
      }
    }

    function zoomOut() {
      if (currentZoom > 0.3) {
        currentZoom -= 0.1;
        updateZoom();
      }
    }

    function resetZoom() {
      currentZoom = 1;
      updateZoom();
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        container.requestFullscreen?.() || 
        container.webkitRequestFullscreen?.() || 
        container.mozRequestFullScreen?.();
        
        container.classList.add('fullscreen');
        img.style.cursor = 'zoom-out';
      } else {
        document.exitFullscreen?.() || 
        document.webkitExitFullscreen?.() || 
        document.mozCancelFullScreen?.();
        
        container.classList.remove('fullscreen');
        img.style.cursor = 'zoom-in';
      }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-' || e.key === '_') zoomOut();
      if (e.key === '0') resetZoom();
      if (e.key === 'f' || e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          toggleFullscreen();
        }
      }
    });

    // Mouse wheel zoom
    img.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    });

    console.log('🎨 Figma Design Preview loaded');
    console.log('Node ID:', '${nodeId}');
    console.log('File Key:', '${FIGMA_FILE_KEY}');
    console.log('');
    console.log('Keyboard shortcuts:');
    console.log('  + / = : Zoom in');
    console.log('  - / _ : Zoom out');
    console.log('  0     : Reset zoom');
    console.log('  F / F11 : Toggle fullscreen');
    console.log('  ESC   : Exit fullscreen');
  </script>
</body>
</html>`;

  const htmlPath = join(outputDir, outputFile);
  writeFileSync(htmlPath, html);
  
  console.log(`💾 Saved HTML: ${htmlPath}`);
  console.log('\n✅ Export complete!');
  console.log(`📏 Image size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\n💡 Open in browser:`);
  console.log(`   file://${join(process.cwd(), htmlPath)}`);
}

// CLI Usage
const args = process.argv.slice(2);
const nodeId = args.find(arg => arg.startsWith('--node-id='))?.split('=')[1] || process.env.FIGMA_NODE_ID || '144:5';
const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'screenshot.html';

exportFigmaPageAsImage(nodeId, outputFile).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});




