import { describe, expect, it } from 'vitest';
import { MAX_SVG_FILE_SIZE, parseSvgDimensions, validateSvg } from './svg';

describe('validateSvg', () => {
  it('accepts a well-formed SVG root element', () => {
    expect(validateSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" />')).toBe(true);
  });

  it('rejects malformed XML and non-SVG documents', () => {
    expect(validateSvg('<svg><path></svg>')).toBe(false);
    expect(validateSvg('<html><body>Not an SVG</body></html>')).toBe(false);
  });
});

describe('parseSvgDimensions', () => {
  it('uses explicit dimensions when available', () => {
    expect(parseSvgDimensions('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" />')).toEqual({ width: 320, height: 180 });
  });

  it('falls back to the viewBox dimensions', () => {
    expect(parseSvgDimensions('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" />')).toEqual({ width: 640, height: 480 });
  });
});

describe('SVG file limit', () => {
  it('is kept at a reasonable browser-safe size', () => {
    expect(MAX_SVG_FILE_SIZE).toBe(5 * 1024 * 1024);
  });
});
