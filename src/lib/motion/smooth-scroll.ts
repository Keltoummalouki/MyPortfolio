import type Lenis from 'lenis'
import { prefersReducedMotion } from './reduced-motion'

// Single entry point for programmatic scrolling. When the Lenis smooth-scroll
// instance is running (public site, motion allowed) it drives the scroll so the
// easing matches wheel/touch scrolling and GSAP ScrollTrigger stays in sync;
// otherwise this falls back to native scrolling.

let lenis: Lenis | null = null

export function setLenisInstance(instance: Lenis | null) {
  lenis = instance
}

export function getLenisInstance(): Lenis | null {
  return lenis
}

/** Scroll so `target` sits at the top of the viewport (minus `offset` px). */
export function scrollToElement(target: Element, offset = 0) {
  const reduce = prefersReducedMotion()
  if (lenis && !reduce && target instanceof HTMLElement) {
    lenis.scrollTo(target, { offset: -offset })
    return
  }
  const top = target.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
}

export function scrollToTop() {
  const reduce = prefersReducedMotion()
  if (lenis && !reduce) {
    lenis.scrollTo(0)
    return
  }
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}
