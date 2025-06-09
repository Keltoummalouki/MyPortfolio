"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

export default function About() {
  const aboutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aboutRef.current) {
      gsap.fromTo(
        aboutRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" }
      )
    }
  }, [])

  return (
    <section
      id="about"
      className="w-full py-24 px-4 bg-white dark:bg-black text-black dark:text-white"
    >
      <div
        ref={aboutRef}
        className="max-w-4xl mx-auto text-center flex flex-col items-center"
      >
        <h2 className="text-4xl font-bold mb-6 text-black dark:text-white">
          À propos de moi
        </h2>
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 max-w-2xl">
          Je suis <strong>Keltoum Malouki</strong>, une développeuse full stack passionnée
          par le développement web et mobile. Grâce à ma formation chez YouCode,
          j&apos;ai acquis des compétences solides en front-end (HTML, CSS, JS, React)
          et en back-end (PHP, Laravel, MySQL). Je suis motivée, curieuse,
          et toujours à la recherche de nouveaux défis pour améliorer mes compétences
          techniques et humaines. J&apos;aime concevoir des interfaces modernes, créatives
          et accessibles à tous.
        </p>
      </div>
    </section>
  )
}