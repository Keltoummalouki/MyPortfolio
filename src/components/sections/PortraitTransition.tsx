'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { animate } from 'animejs'

/** Both server-rendered portraits remain the no-JS/reduced-motion fallback. */
export default function PortraitTransition() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const source = document.querySelector<HTMLElement>('[data-portrait-source]')
      const destination = document.querySelector<HTMLElement>('[data-portrait-destination]')
      const hero = document.querySelector<HTMLElement>('[data-portrait-hero]')
      if (!source || !destination || !hero) return

      // Escape section clipping without moving either layout anchor.
      const layer = destination.cloneNode(true) as HTMLElement
      layer.removeAttribute('data-portrait-destination')
      layer.setAttribute('aria-hidden', 'true')
      layer.className = 'portrait-travel-layer'
      // Positioning is part of the animation contract, not theme styling.
      // Without it, viewport coordinates are applied to a normal-flow element.
      Object.assign(layer.style, {
        position: 'fixed', top: '0px', left: '0px', zIndex: '30',
        overflow: 'hidden', pointerEvents: 'none', transformOrigin: 'top left',
        willChange: 'transform', background: 'var(--card)', visibility: 'hidden',
      })
      layer.querySelectorAll('img').forEach((img) => {
        img.alt = ''
        img.loading = 'eager'
      })
      document.body.appendChild(layer)
      const picture = layer.querySelector('img')
      // Start with the full square hero crop, then grow into the taller frame.
      if (picture) picture.style.objectFit = 'contain'
      const sourceVisibility = source.style.visibility
      const destinationVisibility = destination.style.visibility
      const decorations = Array.from(document.querySelectorAll<HTMLElement>('[data-portrait-detail]'))
      const reveal = animate(decorations, {
        opacity: [0, 1], translateY: [14, 0], duration: 1000,
        autoplay: false, ease: 'outCubic',
      })
      let from = { x: 0, y: 0, width: 1, height: 1 }
      let to = { x: 0, y: 0, width: 1, height: 1 }
      let start = 0
      let end = 1
      const measure = () => {
        const a = source.getBoundingClientRect()
        const b = destination.getBoundingClientRect()
        from = { x: a.left, y: a.top + window.scrollY, width: a.width, height: a.height }
        to = { x: b.left, y: b.top + window.scrollY, width: b.width, height: b.height }
        start = Math.max(0, hero.getBoundingClientRect().top + window.scrollY)
        end = Math.max(start + 1, to.y - Math.max(110, (window.innerHeight - to.height) / 2))
        gsap.set(layer, { width: to.width, height: to.height })
      }
      const render = (progress: number) => {
        const p = gsap.utils.clamp(0, 1, progress)
        const mix = gsap.utils.interpolate
        const width = mix(from.width, to.width, p)
        const height = mix(from.height, to.height, p)
        source.style.visibility = p > 0 ? 'hidden' : sourceVisibility
        destination.style.visibility = p < 1 ? 'hidden' : destinationVisibility
        gsap.set(layer, {
          visibility: p > 0 && p < 1 ? 'visible' : 'hidden',
          x: mix(from.x, to.x, p),
          y: mix(from.y, to.y, p) - window.scrollY,
          scaleX: width / to.width, scaleY: height / to.height,
          borderRadius: `50% 50% ${50 * (1 - p)}% ${50 * (1 - p)}%`,
          maskImage: `linear-gradient(to bottom, black ${100 - 28 * p}%, transparent)`,
        })
        // Counter the frame's aspect morph so the face never stretches.
        const cropScale = mix(1, to.height / to.width, p)
        if (picture) gsap.set(picture, {
          scaleX: cropScale,
          scaleY: cropScale * width / height * (to.height / to.width),
        })
        reveal.seek(gsap.utils.clamp(0, 1, (p - 0.65) / 0.35) * 1000)
      }
      measure()
      const trigger = ScrollTrigger.create({
        start: () => start, end: () => end,
        onRefreshInit: measure,
        onRefresh: (self) => render(self.progress),
        onUpdate: (self) => render(self.progress),
      })
      render(trigger.progress)
      const refresh = () => ScrollTrigger.refresh()
      const observer = new ResizeObserver(refresh)
      observer.observe(source)
      observer.observe(destination)
      observer.observe(hero)
      let disposed = false
      document.fonts.ready.then(() => { if (!disposed) refresh() })
      return () => {
        disposed = true
        observer.disconnect()
        trigger.kill()
        reveal.revert()
        layer.remove()
        source.style.visibility = sourceVisibility
        destination.style.visibility = destinationVisibility
      }
    })
    return () => media.revert()
  }, [])
  return null
}
