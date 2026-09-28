/**
 * SVG utility functions.
 * All processing happens locally in the browser.
 */

export interface SvgDimensions {
  width: number;
  height: number;
}

export const MAX_SVG_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Read an SVG file and return its text content.
 */
export function readSvgFile(file: File): Promise<string> {
  if (file.size > MAX_SVG_FILE_SIZE) {
    return Promise.reject(new Error('SVG files must be 5 MB or smaller.'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      resolve(text);
    };
    reader.onerror = () => reject(new Error('Unable to read the file.'));
    reader.readAsText(file);
  });
}

/**
 * Validate that the string looks like an SVG.
 */
export function validateSvg(source: string): boolean {
  const document = new DOMParser().parseFromString(source, 'image/svg+xml');
  const root = document.documentElement;

  return (
    !document.querySelector('parsererror') &&
    root.localName.toLowerCase() === 'svg' &&
    root.namespaceURI === 'http://www.w3.org/2000/svg'
  );
}

/**
 * Create a safe Blob URL from SVG source.
 * Uses image/svg+xml MIME type so the browser treats it as an image,
 * preventing script execution.
 */
export function createSvgBlobUrl(source: string): string {
  const blob = new Blob([source], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}

/**
 * Revoke a previously created blob URL.
 */
export function revokeBlobUrl(url: string): void {
  try {
    URL.revokeObjectURL(url);
  } catch {
    // Ignore errors from invalid URLs
  }
}

/**
 * Parse SVG dimensions from source code.
 * Tries width/height attributes first, then falls back to viewBox.
 */
export function parseSvgDimensions(source: string): SvgDimensions {
  const parser = new DOMParser();
  const doc = parser.parseFromString(source, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');

  if (!svgEl) {
    return { width: 800, height: 600 };
  }

  // Try explicit width/height
  const widthAttr = svgEl.getAttribute('width');
  const heightAttr = svgEl.getAttribute('height');

  if (widthAttr && heightAttr) {
    const w = parseFloat(widthAttr);
    const h = parseFloat(heightAttr);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      return { width: Math.round(w), height: Math.round(h) };
    }
  }

  // Fall back to viewBox
  const viewBox = svgEl.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/);
    if (parts.length === 4) {
      const w = parseFloat(parts[2]);
      const h = parseFloat(parts[3]);
      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
        return { width: Math.round(w), height: Math.round(h) };
      }
    }
  }

  // Default fallback
  return { width: 800, height: 600 };
}
