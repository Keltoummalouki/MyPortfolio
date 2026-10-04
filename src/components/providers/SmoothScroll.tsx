'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'
import { setLenisInstance } from '@/lib/motion/smooth-scroll'

/** Fixed header height + gap, so anchor targets don't hide under it. */
const ANCHOR_OFFSET = 96

/**
 * Lenis smooth scrolling for the public site, driven by GSAP's ticker so
 * ScrollTrigger animations stay frame-synced. Disabled for visitors who
 * prefer reduced motion (native scrolling, no inertia).
 *
 * - autoToggle: pauses while Radix dialogs/popovers lock page scroll.
 * - allowNestedScroll: scrollable panels (command palette, preference menu)
 *   keep native scrolling.
 * - anchors: in-page links (#contact, #faq…) ease instead of jumping.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return

    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      anchors: { offset: -ANCHOR_OFFSET },
      autoToggle: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    })
    setLenisInstance(lenis)

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Turning on "reduce motion" mid-visit hands scrolling back to the browser.
    let active = true
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) teardown()
    }
    const teardown = () => {
      if (!active) return
      active = false
      media.removeEventListener('change', onChange)
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenisInstance(null)
    }
    media.addEventListener('change', onChange)

    return teardown
  }, [])

  return null
}
