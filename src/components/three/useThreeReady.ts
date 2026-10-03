'use client'

import { useEffect, useState } from 'react'

// Large screens with a mouse, and only when the visitor hasn't asked for less motion.
const CAPABLE_QUERY = '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
const INTERACTION_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'scroll', 'touchstart'] as const

/**
 * Gate for the decorative three.js scenes. Returns true only on capable devices
 * and only after the visitor's first interaction, so three.js (~230 KB gzipped)
 * stays off the critical path: page load and LCP never pay for parsing it or
 * compiling its shaders, and touch devices never download it at all.
 */
export function useThreeReady(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const capable = window.matchMedia(CAPABLE_QUERY)
    if (!capable.matches) return

    const enable = () => {
      cleanup()
      setReady(true)
    }
    const handleCapabilityChange = (e: MediaQueryListEvent) => {
      if (!e.matches) cleanup()
    }
    const cleanup = () => {
      for (const event of INTERACTION_EVENTS) window.removeEventListener(event, enable)
      capable.removeEventListener('change', handleCapabilityChange)
    }

    for (const event of INTERACTION_EVENTS) {
      window.addEventListener(event, enable, { once: true, passive: true })
    }
    capable.addEventListener('change', handleCapabilityChange)
    return cleanup
  }, [])

  return ready
}
