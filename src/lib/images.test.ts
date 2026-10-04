import { describe, expect, it } from 'vitest'
import { isOptimizableImageSrc } from './images'

describe('isOptimizableImageSrc', () => {
  it('accepts site-relative paths', () => {
    expect(isOptimizableImageSrc('/images/keltoum-malouki.jpg')).toBe(true)
  })

  it('accepts Supabase Storage and the GitHub stats hosts over https', () => {
    expect(
      isOptimizableImageSrc('https://abc.supabase.co/storage/v1/object/public/portfolio-media/skill/html5.png'),
    ).toBe(true)
    expect(isOptimizableImageSrc('https://github-readme-stats.vercel.app/api?username=x')).toBe(true)
  })

  it('rejects unknown hosts, plain http, protocol-relative and empty values', () => {
    expect(isOptimizableImageSrc('https://example.com/a.png')).toBe(false)
    expect(isOptimizableImageSrc('https://supabase.co.evil.com/a.png')).toBe(false)
    expect(isOptimizableImageSrc('http://abc.supabase.co/a.png')).toBe(false)
    expect(isOptimizableImageSrc('//abc.supabase.co/a.png')).toBe(false)
    expect(isOptimizableImageSrc('')).toBe(false)
    expect(isOptimizableImageSrc(null)).toBe(false)
    expect(isOptimizableImageSrc('not a url')).toBe(false)
  })
})
