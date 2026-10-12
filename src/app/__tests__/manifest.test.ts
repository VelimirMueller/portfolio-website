/** @jest-environment node */
import fs from 'fs';
import path from 'path';
import manifest from '../manifest';
import { SITE_NAME } from '@/config/positioning';

const root = path.join(__dirname, '..', '..', '..');

/** Width, height and colour type from a PNG IHDR chunk. */
function pngInfo(file: string) {
  const buf = fs.readFileSync(file);
  expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), colorType: buf[25] };
}

describe('manifest', () => {
  const result = manifest();

  it('names the site and uses the dark favicon tile colour', () => {
    expect(result.name).toBe(SITE_NAME);
    expect(result.theme_color).toBe('#09090b');
    expect(result.background_color).toBe('#09090b');
  });

  it.each(['any', 'maskable'])('lists 192 and 512 px icons for purpose %s', (purpose) => {
    const sizes = (result.icons ?? []).filter((i) => i.purpose === purpose).map((i) => i.sizes);
    expect(sizes).toEqual(['192x192', '512x512']);
  });

  it('points every icon at a PNG in public/ with the declared size', () => {
    for (const icon of result.icons ?? []) {
      const [w, h] = (icon.sizes ?? '').split('x').map(Number);
      const info = pngInfo(path.join(root, 'public', icon.src));
      expect([info.width, info.height]).toEqual([w, h]);
    }
  });
});

describe('app icon files', () => {
  const app = path.join(root, 'src', 'app');

  it('ships favicon.ico with 16, 32 and 48 px entries', () => {
    const buf = fs.readFileSync(path.join(app, 'favicon.ico'));
    expect(buf.readUInt16LE(2)).toBe(1); // type 1 = icon
    const count = buf.readUInt16LE(4);
    const sizes = Array.from({ length: count }, (_, i) => buf[6 + i * 16]);
    expect(sizes).toEqual([16, 32, 48]);
  });

  it('ships an SVG icon', () => {
    const svg = fs.readFileSync(path.join(app, 'icon.svg'), 'utf8');
    expect(svg).toMatch(/<svg[^>]+viewBox="0 0 32 32"/);
  });

  it('ships an opaque 180 px Apple touch icon', () => {
    // Colour type 2 = RGB without alpha: iOS rounds the corners itself.
    expect(pngInfo(path.join(app, 'apple-icon.png'))).toEqual({ width: 180, height: 180, colorType: 2 });
  });

  it('serves the same Apple touch icon at the fixed /apple-touch-icon.png path', () => {
    // iOS and crawlers request this path without reading the <link> tag (issue #105).
    const fixed = fs.readFileSync(path.join(root, 'public', 'apple-touch-icon.png'));
    expect(fixed.equals(fs.readFileSync(path.join(app, 'apple-icon.png')))).toBe(true);
  });
});
