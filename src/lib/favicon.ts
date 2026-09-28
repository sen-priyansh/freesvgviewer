/**
 * Favicon (ICO) export utility.
 * Renders SVG at multiple sizes and packs them into a .ico file.
 * All processing happens locally in the browser.
 */

import { createSvgBlobUrl, revokeBlobUrl } from './svg';

const FAVICON_SIZES = [16, 32, 48];

/**
 * Export SVG source as a .ico favicon file.
 * Generates 16x16, 32x32, and 48x48 PNG images packed into ICO format.
 */
export async function exportSvgAsFavicon(
  svgSource: string,
  fileName: string = 'favicon.ico'
): Promise<void> {
  const blobUrl = createSvgBlobUrl(svgSource);

  try {
    const img = await loadImage(blobUrl);
    const pngBuffers: ArrayBuffer[] = [];

    for (const size of FAVICON_SIZES) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Unable to create canvas context.');

      ctx.drawImage(img, 0, 0, size, size);

      const blob = await canvasToBlob(canvas, 'image/png');
      const buffer = await blob.arrayBuffer();
      pngBuffers.push(buffer);
    }

    const icoBlob = buildIco(pngBuffers, FAVICON_SIZES);
    downloadBlob(icoBlob, fileName);
  } finally {
    revokeBlobUrl(blobUrl);
  }
}

/**
 * Build an ICO file from multiple PNG buffers.
 *
 * ICO format:
 *   ICONDIR header (6 bytes)
 *   ICONDIRENTRY[] (16 bytes each)
 *   Image data (PNG bytes concatenated)
 */
function buildIco(pngBuffers: ArrayBuffer[], sizes: number[]): Blob {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + entrySize * numImages;

  // Calculate total size
  let totalDataSize = 0;
  for (const buf of pngBuffers) {
    totalDataSize += buf.byteLength;
  }

  const icoBuffer = new ArrayBuffer(dirSize + totalDataSize);
  const view = new DataView(icoBuffer);

  // ICONDIR header
  view.setUint16(0, 0, true);      // Reserved, must be 0
  view.setUint16(2, 1, true);      // Type: 1 = ICO
  view.setUint16(4, numImages, true); // Number of images

  // Write ICONDIRENTRY for each image, then the image data
  let dataOffset = dirSize;

  for (let i = 0; i < numImages; i++) {
    const entryOffset = headerSize + i * entrySize;
    const size = sizes[i];
    const pngData = pngBuffers[i];

    // Width (0 means 256)
    view.setUint8(entryOffset + 0, size >= 256 ? 0 : size);
    // Height (0 means 256)
    view.setUint8(entryOffset + 1, size >= 256 ? 0 : size);
    // Color palette count (0 for no palette / truecolor)
    view.setUint8(entryOffset + 2, 0);
    // Reserved
    view.setUint8(entryOffset + 3, 0);
    // Color planes
    view.setUint16(entryOffset + 4, 1, true);
    // Bits per pixel
    view.setUint16(entryOffset + 6, 32, true);
    // Image data size
    view.setUint32(entryOffset + 8, pngData.byteLength, true);
    // Offset to image data from beginning of file
    view.setUint32(entryOffset + 12, dataOffset, true);

    // Copy PNG data
    const dst = new Uint8Array(icoBuffer, dataOffset, pngData.byteLength);
    dst.set(new Uint8Array(pngData));

    dataOffset += pngData.byteLength;
  }

  return new Blob([icoBuffer], { type: 'image/x-icon' });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to render the SVG for favicon export.'));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Unable to generate image.'));
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
