import { describe, expect, it } from 'vitest';
import {
  assertSafeExportDimensions,
  getScaleForLongEdge,
  MAX_EXPORT_DIMENSION,
  MAX_EXPORT_PIXELS,
} from './png';

describe('assertSafeExportDimensions', () => {
  it('allows normal export sizes', () => {
    expect(() => assertSafeExportDimensions(1200, 800, 2)).not.toThrow();
  });

  it('rejects an oversized side', () => {
    expect(() => assertSafeExportDimensions(MAX_EXPORT_DIMENSION + 1, 20, 1)).toThrow('limited');
  });

  it('rejects an excessive pixel count', () => {
    const side = Math.ceil(Math.sqrt(MAX_EXPORT_PIXELS + 1));
    expect(() => assertSafeExportDimensions(side, side, 1)).toThrow('too large');
  });
});

describe('getScaleForLongEdge', () => {
  it('upscales small SVGs to the requested output size', () => {
    expect(getScaleForLongEdge(128, 64, 1024)).toBe(8);
  });

  it('does not downscale a source that is already larger', () => {
    expect(getScaleForLongEdge(2400, 1200, 1024)).toBe(1);
  });
});
