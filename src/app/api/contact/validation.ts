import { CONTACT_FIELDS, contactFieldReason, type ContactField, type ContactFields } from '@/utils/contact/schema';

// The field rules live in @/utils/contact/schema, shared with the contact form (issue #186).

export type ContactPayload = ContactFields & { hCaptchaToken: string };

type ParseResult =
  | { success: true; data: ContactPayload }
  | { success: false; error: string; field?: ContactField };

export function parseContactPayload(payload: unknown): ParseResult {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { success: false, error: 'payload: invalid' };
  }
  const body = payload as Record<string, unknown>;
  for (const field of CONTACT_FIELDS) {
    const reason = contactFieldReason(field, body[field]);
    if (reason) return { success: false, error: `${field}: ${reason}`, field };
  }
  const { hCaptchaToken } = body;
  if (typeof hCaptchaToken !== 'string' || hCaptchaToken.length === 0) {
    return { success: false, error: 'hCaptchaToken: invalid' };
  }
  return {
    success: true,
    data: {
      name: (body.name as string).trim(),
      email: (body.email as string).trim(),
      message: (body.message as string).trim(),
      hCaptchaToken,
    },
  };
}
