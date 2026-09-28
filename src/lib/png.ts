/**
 * PNG export utility.
 * Renders SVG to canvas and exports as PNG.
 * All processing happens locally in the browser.
 */

import { parseSvgDimensions, createSvgBlobUrl, revokeBlobUrl } from './svg';

/**
 * Export SVG source code as a PNG file.
 * Uses the original SVG dimensions, not the current zoom level.
 */
export async function exportSvgAsPng(
  svgSource: string,
  fileName: string = 'export.png'
): Promise<void> {
  const { width, height } = parseSvgDimensions(svgSource);

  // Use device pixel ratio for sharper exports
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const canvasWidth = width * scale;
  const canvasHeight = height * scale;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create canvas context.');
  }

  // Create a blob URL for the SVG
  const blobUrl = createSvgBlobUrl(svgSource);

  try {
    // Load the SVG as an image
    const img = await loadImage(blobUrl);

    // Draw to canvas at full resolution
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    // Export as PNG blob
    const pngBlob = await canvasToBlob(canvas, 'image/png');

    // Trigger download
    downloadBlob(pngBlob, fileName);
  } finally {
    revokeBlobUrl(blobUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to render the SVG for export.'));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Unable to generate PNG.'));
        }
      },
      type,
      1.0
    );
  });
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
