'use client'

import { useEffect, useRef } from 'react'

// Renders a Cloudflare Turnstile widget ONLY when NEXT_PUBLIC_TURNSTILE_SITE_KEY
// is configured. When the key is absent (e.g. local dev) it renders nothing and
// the contact form works without a captcha — the server verifier bypasses too.

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

export default function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!SITE_KEY) return
    const container = ref.current
    if (!container) return

    const render = () => {
      if (!window.turnstile || !container || container.childElementCount > 0) return
      window.turnstile.render(container, {
        sitekey: SITE_KEY,
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(null),
        'error-callback': () => onToken(null),
      })
    }

    if (window.turnstile) {
      render()
      return
    }

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
  }, [onToken])

  if (!SITE_KEY) return null
  return <div ref={ref} className="flex justify-center" />
}
