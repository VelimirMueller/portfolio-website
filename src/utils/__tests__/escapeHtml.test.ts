import { escapeHtml } from '../escapeHtml';

describe('escapeHtml', () => {
  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('escapes ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes double and single quotes (attribute injection)', () => {
    expect(escapeHtml('" onmouseover="evil()"')).toBe(
      '&quot; onmouseover=&quot;evil()&quot;'
    );
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('escapes ampersand before other entities (no double escaping)', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('returns plain text unchanged', () => {
    expect(escapeHtml('Hello World 123 äöü')).toBe('Hello World 123 äöü');
  });

  it('handles the empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});
