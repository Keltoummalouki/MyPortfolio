"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const experienceData = [
  {
    title: "Stage Front-End Développeuse",
    company: "Entreprise Caisse Manager — Rabat, Maroc",
    date: "Juin 2024 - Présent",
    description: "Stage de 2 mois en développement front-end : création d’interfaces utilisateur modernes, intégration d’API et respect des bonnes pratiques UI/UX."
  },
  {
    title: "Développeuse Full Stack Freelance",
    company: "Fiverr (Plateforme en ligne)",
    date: "2024",
    description: "Création de projets web complets pour des clients internationaux, intégration d’API, développement d'interfaces modernes et optimisation de la performance."
  },
  {
    title: "Docker Foundations Professional Certificate",
    company: "Docker, Inc.",
    date: "Mars 2025",
    description: "Certification obtenue sur Docker Products and Containerization."
  }
]

export default function ExperienceSection() {
  const sectionRef = useRef(null)
  const itemRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const section = sectionRef.current

    gsap.fromTo(
      section,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: "top 85%"
        }
      }
    )

    itemRefs.current.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: i * 0.2,
          scrollTrigger: {
            trigger: el,
            start: "top 90%"
          }
        }
      )
    })
  }, [])

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="py-24 bg-white dark:bg-black text-black dark:text-white"
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white">
            Mon Expérience Professionnelle & Certifications
          </h2>
          <p className="text-lg text-black dark:text-white">
            Voici les rôles que j’ai occupés dans le monde professionnel et freelance, ainsi que mes certifications.
          </p>
        </div>

        <div className="relative border-l-2 border-purple-600 ml-4">
          {experienceData.map((exp, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) itemRefs.current[index] = el
              }}
              className="relative mb-12 pl-6 bg-white dark:bg-black rounded-lg py-4"
            >
              <span className="absolute w-4 h-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full left-[-10px] top-1.5"></span>
              <h3 className="text-xl font-bold mb-1 text-black dark:text-white">{exp.title}</h3>
              <p className="italic text-black dark:text-white text-sm">{exp.company}</p>
              <p className="text-sm text-black dark:text-white mb-2">{exp.date}</p>
              <p className="text-black dark:text-white text-base leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
