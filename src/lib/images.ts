// Which image sources may go through the Next.js optimizer (`next/image`
// default loader). Must mirror `images.remotePatterns` in next.config.ts: a
// remote host that is not listed there makes next/image throw at render time,
// so anything else is rendered `unoptimized` instead of breaking the page.

const OPTIMIZABLE_HOSTS = [/(^|\.)supabase\.co$/i]

/** True for site-relative paths and https URLs on a configured remote host. */
export function isOptimizableImageSrc(src: string | null | undefined): boolean {
  const value = src?.trim()
  if (!value) return false
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && OPTIMIZABLE_HOSTS.some((host) => host.test(url.hostname))
  } catch {
    return false
  }
}
