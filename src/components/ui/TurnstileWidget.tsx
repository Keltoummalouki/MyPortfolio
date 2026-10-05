'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// Renders a Cloudflare Turnstile widget ONLY when NEXT_PUBLIC_TURNSTILE_SITE_KEY
// is configured. When the key is absent (e.g. local dev) it renders nothing and
// the contact form works without a captcha — the server verifier bypasses too.
// The Cloudflare script (~600 KB with its challenge assets) is only fetched once
// the widget scrolls near the viewport, so it never weighs on the initial load.

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export default function TurnstileWidget({
  onToken,
  className,
}: {
  onToken: (token: string | null) => void
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!SITE_KEY) return
    const container = ref.current
    if (!container) return

    const render = () => {
      if (!window.turnstile || !container || container.childElementCount > 0) return
      window.turnstile.render(container, {
        sitekey: SITE_KEY,
        // Follow the site theme (class on <html>), not the OS setting that
        // Turnstile's 'auto' reads, so it never renders a white box on dark.
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(null),
        'error-callback': () => onToken(null),
      })
    }

    if (window.turnstile) {
      render()
      return
    }

    const load = () => {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
      if (!script) {
        script = document.createElement('script')
        script.src = SCRIPT_SRC
        script.async = true
        script.defer = true
        script.addEventListener('load', render)
        document.head.appendChild(script)
      } else {
        script.addEventListener('load', render)
      }
    }

    if (!('IntersectionObserver' in window)) {
      load()
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        load()
      },
      { rootMargin: '400px 0px' },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [onToken])

  if (!SITE_KEY) return null
  // Reserve the widget's height (65px) so it doesn't shift the form when it renders.
  return <div ref={ref} className={cn('flex min-h-[65px] justify-center', className)} />
}
