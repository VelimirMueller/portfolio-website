// One rule set for the contact form (client) and POST /api/contact (server),
// so the form never accepts a value the API refuses (issue #186).
// Plain TypeScript on purpose: the form ships this to the browser, and zod
// (also zod/mini) adds about 23-30 kB gzip to the contact page.

export const CONTACT_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 5000 },
} as const;

// The pattern zod 4 uses for z.email(), which the API used before, so the API
// accepts the same addresses as before.
const EMAIL_PATTERN =
  /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;

export type ContactFields = { name: string; email: string; message: string };
export type ContactField = keyof ContactFields;
export const CONTACT_FIELDS: readonly ContactField[] = ['name', 'email', 'message'];

/** Why a field fails: too short, too long, or not valid (wrong format or type). */
export type ContactFieldReason = 'tooShort' | 'tooLong' | 'invalid';

export function isContactField(value: unknown): value is ContactField {
  return typeof value === 'string' && (CONTACT_FIELDS as readonly string[]).includes(value);
}

/** Checks the trimmed value of one field; null means the value is valid. */
export function contactFieldReason(field: ContactField, value: unknown): ContactFieldReason | null {
  if (typeof value !== 'string') return 'invalid';
  const trimmed = value.trim();
  const limits: { min?: number; max: number } = CONTACT_LIMITS[field];
  if (limits.min !== undefined && trimmed.length < limits.min) return 'tooShort';
  if (trimmed.length > limits.max) return 'tooLong';
  if (field === 'email' && !EMAIL_PATTERN.test(trimmed)) return 'invalid';
  return null;
}

/** The failing reason per field; an empty object means all fields are valid. */
export function contactFieldErrors(
  values: Partial<Record<ContactField, unknown>>,
): Partial<Record<ContactField, ContactFieldReason>> {
  const errors: Partial<Record<ContactField, ContactFieldReason>> = {};
  for (const field of CONTACT_FIELDS) {
    const reason = contactFieldReason(field, values[field]);
    if (reason) errors[field] = reason;
  }
  return errors;
}
