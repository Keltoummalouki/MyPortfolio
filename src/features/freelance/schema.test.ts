import { describe, it, expect } from 'vitest'
import { leadFormSchema, leadStatusSchema } from './schema'

const valid = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  company: '',
  projectType: 'web_app',
  budget: '1k_5k',
  timeline: 'asap',
  contactPreference: 'email',
  details: 'We need a multilingual web application for bookings.',
}

describe('leadFormSchema', () => {
  it('accepts a valid lead and normalizes empty optionals to null', () => {
    const result = leadFormSchema.safeParse({ ...valid, company: '', timeline: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.company).toBeNull()
      expect(result.data.timeline).toBeNull()
      expect(result.data.projectType).toBe('web_app')
    }
  })

  it('rejects an invalid email', () => {
    expect(leadFormSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
  })

  it('requires details', () => {
    expect(leadFormSchema.safeParse({ ...valid, details: 'too short' }).success).toBe(false)
  })

  it('rejects an unknown project type', () => {
    expect(leadFormSchema.safeParse({ ...valid, projectType: 'mobile' }).success).toBe(false)
  })
})

describe('leadStatusSchema', () => {
  it('accepts pipeline statuses', () => {
    expect(leadStatusSchema.safeParse('qualified').success).toBe(true)
    expect(leadStatusSchema.safeParse('won').success).toBe(true)
  })

  it('rejects unknown statuses', () => {
    expect(leadStatusSchema.safeParse('pending').success).toBe(false)
  })
})
