import { z } from 'zod'

// Validation for the contact inbox. Pure (no server imports) so it is safe to
// import from Client Components and unit tests.

export const MESSAGE_STATUSES = ['new', 'read', 'replied', 'archived', 'spam'] as const
export type MessageStatus = (typeof MESSAGE_STATUSES)[number]
export const messageStatusSchema = z.enum(MESSAGE_STATUSES)

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(120, 'Name is too long'),
  email: z.email('Enter a valid email').max(320),
  subject: z
    .string()
    .trim()
    .max(200, 'Subject is too long')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  message: z.string().trim().min(10, 'Message is too short').max(5000, 'Message is too long'),
})

export type ContactMessageValues = z.output<typeof contactMessageSchema>

export interface ContactSubmitResult {
  ok: boolean
  /** Coarse, non-leaking reason code for the client to map to a localized message. */
  error?: 'invalid' | 'captcha' | 'server'
}
