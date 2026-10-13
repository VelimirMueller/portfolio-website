import { CONTACT_FIELDS, contactFieldErrors, isContactField } from '../schema';

const valid = { name: 'Jane Doe', email: 'jane@example.com', message: 'Hello, I would like to work with you.' };

describe('contactFieldErrors', () => {
  it('returns no errors for valid fields', () => {
    expect(contactFieldErrors(valid)).toEqual({});
  });

  it('reports a too short name after trimming', () => {
    expect(contactFieldErrors({ ...valid, name: '  J  ' })).toEqual({ name: 'tooShort' });
  });

  it('reports a too long field', () => {
    expect(contactFieldErrors({ ...valid, name: 'a'.repeat(101) })).toEqual({ name: 'tooLong' });
    expect(contactFieldErrors({ ...valid, message: 'a'.repeat(5001) })).toEqual({ message: 'tooLong' });
    expect(contactFieldErrors({ ...valid, email: `${'a'.repeat(250)}@example.com` }).email).toBeDefined();
  });

  it('accepts the maximum lengths', () => {
    expect(contactFieldErrors({ ...valid, name: 'a'.repeat(100), message: 'a'.repeat(5000) })).toEqual({});
  });

  it('reports an invalid email', () => {
    expect(contactFieldErrors({ ...valid, email: 'not-an-email' })).toEqual({ email: 'invalid' });
  });

  it('reports a non-string value as invalid', () => {
    expect(contactFieldErrors({ ...valid, name: 42 as unknown as string })).toEqual({ name: 'invalid' });
    expect(contactFieldErrors({})).toEqual({ name: 'invalid', email: 'invalid', message: 'invalid' });
  });

  it('accepts addresses the old zod email rule accepted', () => {
    for (const email of ['jane.doe+tag@example.co.uk', "o'neil@sub.example.com", 'x_y@a-b.io']) {
      expect(contactFieldErrors({ ...valid, email })).toEqual({});
    }
    for (const email of ['jane@', '@example.com', 'jane@example', 'jane doe@example.com', 'jane@.com']) {
      expect(contactFieldErrors({ ...valid, email })).toEqual({ email: 'invalid' });
    }
  });

  it('reports one reason per field', () => {
    expect(contactFieldErrors({ name: '', email: '', message: '' })).toEqual({
      name: 'tooShort',
      email: 'invalid',
      message: 'tooShort',
    });
  });
});

describe('isContactField', () => {
  it('accepts only the three form fields', () => {
    expect(CONTACT_FIELDS).toEqual(['name', 'email', 'message']);
    expect(isContactField('message')).toBe(true);
    expect(isContactField('hCaptchaToken')).toBe(false);
    expect(isContactField(undefined)).toBe(false);
  });
});
