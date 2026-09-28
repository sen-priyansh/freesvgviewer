import { describe, expect, it } from 'vitest';
import { assertSafeExportDimensions, MAX_EXPORT_DIMENSION, MAX_EXPORT_PIXELS } from './png';

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
