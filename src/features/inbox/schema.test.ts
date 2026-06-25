import { describe, it, expect } from 'vitest'
import { contactMessageSchema, messageStatusSchema } from './schema'

const valid = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'Hello, I would like to discuss a project with you.',
}

describe('contactMessageSchema', () => {
  it('accepts a valid message and normalizes an empty subject to null', () => {
    const result = contactMessageSchema.safeParse({ ...valid, subject: '   ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.subject).toBeNull()
  })

  it('rejects an invalid email', () => {
    expect(contactMessageSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
  })

  it('rejects a too-short message', () => {
    expect(contactMessageSchema.safeParse({ ...valid, message: 'hi' }).success).toBe(false)
  })

  it('rejects a missing name', () => {
    expect(contactMessageSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })
})

describe('messageStatusSchema', () => {
  it('accepts known statuses', () => {
    expect(messageStatusSchema.safeParse('replied').success).toBe(true)
  })

  it('rejects unknown statuses', () => {
    expect(messageStatusSchema.safeParse('deleted').success).toBe(false)
  })
})
