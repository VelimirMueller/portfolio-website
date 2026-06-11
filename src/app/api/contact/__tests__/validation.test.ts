import { parseContactPayload } from '../validation';

describe('parseContactPayload', () => {
  const valid = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hello, I would like to work with you.',
    hCaptchaToken: 'token-123',
  };

  it('accepts a valid payload', () => {
    const result = parseContactPayload(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Jane Doe');
      expect(result.data.email).toBe('jane@example.com');
    }
  });

  it('trims surrounding whitespace from fields', () => {
    const result = parseContactPayload({
      ...valid,
      name: '  Jane Doe  ',
      email: ' jane@example.com ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Jane Doe');
      expect(result.data.email).toBe('jane@example.com');
    }
  });

  it('rejects a missing name', () => {
    const { name: _name, ...rest } = valid;
    expect(parseContactPayload(rest).success).toBe(false);
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(parseContactPayload({ ...valid, name: 'J' }).success).toBe(false);
  });

  it('rejects a name longer than 100 characters', () => {
    expect(
      parseContactPayload({ ...valid, name: 'a'.repeat(101) }).success
    ).toBe(false);
  });

  it('rejects an invalid email format', () => {
    expect(parseContactPayload({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects an email longer than 254 characters', () => {
    const longEmail = `${'a'.repeat(250)}@example.com`;
    expect(parseContactPayload({ ...valid, email: longEmail }).success).toBe(false);
  });

  it('rejects a message shorter than 10 characters', () => {
    expect(parseContactPayload({ ...valid, message: 'too short' }).success).toBe(false);
  });

  it('rejects a message longer than 5000 characters', () => {
    expect(
      parseContactPayload({ ...valid, message: 'a'.repeat(5001) }).success
    ).toBe(false);
  });

  it('rejects a missing captcha token', () => {
    expect(parseContactPayload({ ...valid, hCaptchaToken: '' }).success).toBe(false);
  });

  it('rejects non-string field types', () => {
    expect(parseContactPayload({ ...valid, name: 42 }).success).toBe(false);
    expect(parseContactPayload({ ...valid, message: ['x'] }).success).toBe(false);
  });

  it('rejects non-object payloads', () => {
    expect(parseContactPayload(null).success).toBe(false);
    expect(parseContactPayload('string').success).toBe(false);
  });

  it('returns an error description on failure', () => {
    const result = parseContactPayload({ ...valid, email: 'nope' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/email/i);
    }
  });
});
