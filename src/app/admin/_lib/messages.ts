import { z } from 'zod';

export const MESSAGE_STATUSES = ['new', 'read', 'archived', 'spam'] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const statusSchema = z.enum(MESSAGE_STATUSES);
export const messageIdSchema = z.string().uuid();

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
  created_at: string | null;
}

/** Filter shown by default and when the query string holds an unknown value. */
export function parseStatusFilter(value: unknown): MessageStatus | 'all' {
  if (value === 'all') return 'all';
  const parsed = statusSchema.safeParse(value);
  return parsed.success ? parsed.data : 'new';
}

/**
 * Decides what opening a message in /admin/[id] does to its status.
 * Return the status to store, or null to leave it unchanged.
 */
export function statusAfterOpening(current: MessageStatus): MessageStatus | null {
  // Opening a new message marks it read, like a mail client. Archived and
  // spam stay where they were filed; read is already read.
  return current === 'new' ? 'read' : null;
}
