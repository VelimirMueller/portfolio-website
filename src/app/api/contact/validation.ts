import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(5000),
  hCaptchaToken: z.string().min(1),
});

export type ContactPayload = z.infer<typeof contactSchema>;

type ParseResult =
  | { success: true; data: ContactPayload }
  | { success: false; error: string };

export function parseContactPayload(payload: unknown): ParseResult {
  const result = contactSchema.safeParse(payload);
  if (!result.success) {
    const first = result.error.issues[0];
    const field = first.path.join('.') || 'payload';
    return { success: false, error: `${field}: ${first.message}` };
  }
  return { success: true, data: result.data };
}
