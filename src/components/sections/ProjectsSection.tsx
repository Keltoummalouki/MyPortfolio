"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { Github, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    title: "BudgetBuddy",
    description: "Application de gestion des dépenses avec interface responsive.",
    technologies: ["Laravel", "Sanctum", "React.js", "Axios", "PostgreSQL", "Swagger"],
    image: "/images/BudgetBuddy.png",
    gitHub: "https://github.com/Keltoummalouki/BudgetBuddy",
    demo: ""
  },
  {
    title: "Tests Acceptance Platform",
    description: "Plateforme pour automatiser l'inscription et la gestion des rôles.",
    technologies: ["Laravel", "Blade", "PHP", "PostgreSQL", "UML"],
    image: "/images/youcode.png",
    gitHub: "https://github.com/Keltoummalouki/Tests-Acceptance-Platform-Youcode",
    demo: ""
  },
  {
    title: "DentaCare",
    description: "Solution de gestion des rendez-vous pour cabinets dentaires.",
    technologies: ["Langage C"],
    image: "/images/dentacare.jpg",
    gitHub: "https://github.com/Keltoummalouki/DentaCare",
    demo: ""
  },
  {
    title: "Clone Udemy",
    description: "LMS (e-learning) pour gérer utilisateurs et cours.",
    technologies: ["HTML", "Tailwind CSS", "JavaScript", "PHP", "MySQL", "UML"],
    image: "/images/Udemy.png",
    gitHub: "https://github.com/Keltoummalouki/Youdemy",
    demo: ""
  },
    {
    title: "Clone Airbnb",
    technologies: ["HTML", "Blade", "JS", "PHP", "PostgreSQL"],
    description: "Plateforme de réservation immobilière avec interface utilisateur moderne et système de réservation complet.",
    image: "/images/airbnb.jpg",
    gitHub: "https://github.com/Aboussebaba-Othman/Airbnb",
    demo: "",
  },
  {
    title: "Elite Squad Manager",
    description: "Plateforme interactive pour la gestion des joueurs et équipes en ligne avec statistiques avancées.",
    technologies: ["HTML", "CSS", "JS"],
    image: "/images/elitesquad.jpg",
    gitHub: "https://github.com/Keltoummalouki/youdemy",
    demo: "",
  },
  {
    title: "ShopZone",
    description: "Boutique e-commerce moderne avec panier d'achat, système de paiement et gestion des commandes.",
    technologies: ["HTML", "Tailwind CSS", "JS"],
    image: "/images/shopzone.png",
    gitHub: "https://github.com/Aboussebaba-Othman/Airbnb",
    demo: "",
  },
]

export default function ProjectsSection() {
  const sectionRef = useRef(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const perPage = 3

  const totalPages = Math.ceil(projects.length / perPage)
  const currentProjects = projects.slice(
    currentPage * perPage,
    currentPage * perPage + perPage
  )

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
  }

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
  }

  useEffect(() => {
    const cards = cardsRef.current
    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.2,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        }
      )
    })
  }, [currentPage])

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="py-24 bg-white dark:bg-black text-black dark:text-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white">
            Mes Projets
          </h2>
          <p className="text-xl text-black dark:text-white max-w-2xl mx-auto">
            Voici quelques réalisations techniques basées sur mon expérience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {currentProjects.map((project, index) => (
            <div
              key={`${currentPage}-${index}`}
              ref={(el) => { cardsRef.current[index] = el! }}
              className="group relative bg-white dark:bg-black rounded-2xl shadow-xl hover:shadow-purple-600 transition-all duration-500 overflow-hidden border border-purple-800/30"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-black dark:text-white group-hover:text-purple-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-black dark:text-white mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="bg-white dark:bg-black text-black dark:text-white text-xs px-3 py-1 rounded-full font-medium border border-purple-600/40"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  {project.gitHub && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 text-black dark:text-white bg-white dark:bg-black"
                    >
                      <a
                        href={project.gitHub}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-black dark:text-white"
                      >
                        <Github size={16} />
                        Code
                      </a>
                    </Button>
                  )}

                  {project.demo && (
                    <Button
                      size="sm"
                      asChild
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-black dark:text-white"
                    >
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-black dark:text-white"
                      >
                        <ExternalLink size={16} />
                        Demo
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prevPage}
            disabled={currentPage === 0}
            className="rounded-full text-black dark:text-white bg-white dark:bg-black"
          >
            <ChevronLeft size={20} />
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === currentPage
                    ? 'bg-purple-500 scale-125'
                    : 'bg-white dark:bg-black text-black dark:text-white hover:bg-purple-400'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className="rounded-full text-black dark:text-white bg-white dark:bg-black"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </section>
  )
}
