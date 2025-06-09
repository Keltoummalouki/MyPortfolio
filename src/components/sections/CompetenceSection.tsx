"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const skills = [
  {
    category: "Frontend",
    technologies: [
      { name: "React", level: 80 },
      { name: "Next.js", level: 70 },
      { name: "TypeScript", level: 70 },
      { name: "Tailwind CSS", level: 95 },
      { name: "JavaScript", level: 95 },
      { name: "HTML", level: 100 },
      { name: "CSS", level: 95 }
    ]
  },
  {
    category: "Backend",
    technologies: [
      { name: "Node.js", level: 75 },
      { name: "PHP", level: 95 },
      { name: "Laravel", level: 90 },
    ]
  },
  {
    category: "Base de données",
    technologies: [
      { name: "MySQL", level: 95 },
      { name: "PostgreSQL", level: 80 },
    ]
  },
  {
    category: "Outils & Autres",
    technologies: [
      { name: "Git", level: 95 },
      { name: "GitHub", level: 95 },
      { name: "Docker", level: 70 },
      { name: "Figma", level: 95 },
      { name: "Photoshop", level: 75 },
      { name: "Canva", level: 85 }
    ]
  }
]

export default function CompetenceSection() {
  const sectionRef = useRef(null)
  const skillsRef = useRef<HTMLDivElement[]>([])
  const [page, setPage] = useState(0)
  const perPage = 2

  const paginatedSkills = skills.slice(page * perPage, page * perPage + perPage)
  const totalPages = Math.ceil(skills.length / perPage)

  useEffect(() => {
    const element = sectionRef.current

    gsap.fromTo(
      element,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
        },
      }
    )

    skillsRef.current.forEach((skill, index) => {
      gsap.fromTo(
        skill,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: skill,
            start: "top 85%",
          },
        }
      )
    })
  }, [page])

  return (
    <section
      id="competences"
      ref={sectionRef}
      className="py-24 bg-white dark:bg-black text-black dark:text-white"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white">
            Mes Compétences
          </h2>
          <p className="text-xl text-black dark:text-white max-w-2xl mx-auto">
            Voici un aperçu de mes compétences techniques et de mon niveau de maîtrise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {paginatedSkills.map((skillGroup, groupIndex) => (
            <div
              key={groupIndex}
              ref={(el) => { skillsRef.current[groupIndex] = el!; }}
              className="bg-white dark:bg-black rounded-2xl p-8 shadow-lg hover:shadow-purple-600 transition-all duration-500 border border-purple-800/30"
            >
              <h3 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
                {skillGroup.category}
              </h3>
              <div className="space-y-4">
                {skillGroup.technologies.map((tech, techIndex) => (
                  <div key={techIndex} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-black dark:text-white">
                        {tech.name}
                      </span>
                      <span className="text-sm text-black dark:text-white">
                        {tech.level}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${tech.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            onClick={() => setPage(page > 0 ? page - 1 : 0)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-black text-black dark:text-white border border-white/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
            disabled={page === 0}
          >
            &#8249;
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setPage(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === page ? "bg-purple-500 scale-125" : "bg-gray-600 hover:bg-purple-300"
              }`}
            />
          ))}

          <button
            onClick={() => setPage(page < totalPages - 1 ? page + 1 : page)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-black text-black dark:text-white border border-white/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
            disabled={page === totalPages - 1}
          >
            &#8250;
          </button>
        </div>
      </div>
    </section>
  )
}
