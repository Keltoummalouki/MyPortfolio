"use client"

import { useEffect, useRef } from "react"
import { Github } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function GitHubStats() {
  const sectionRef = useRef(null)

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
          start: "top 85%",
        },
      }
    )
  }, [])

  return (
    <section
      id="github"
      ref={sectionRef}
      className="py-24 bg-white dark:bg-black text-black dark:text-white"
    >
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white">
          Mes Statistiques GitHub
        </h2>
        <p className="text-lg mb-10 text-black dark:text-white">
          Un aperçu visuel de mon activité et de mes contributions open-source sur GitHub.
        </p>

        <div className="flex flex-col items-center gap-8">
          <Image
            src="https://github-readme-stats.vercel.app/api?username=Keltoummalouki&show_icons=true&theme=radical&hide_title=true"
            alt="Statistiques GitHub"
            width={500}
            height={200}
            className="w-full max-w-xl rounded-xl shadow-lg bg-white dark:bg-black"
          />

          <Image
            src="https://github-readme-streak-stats.herokuapp.com?user=Keltoummalouki&theme=radical"
            alt="GitHub Streak"
            width={500}
            height={200}
            className="w-full max-w-xl rounded-xl shadow-lg bg-white dark:bg-black"
          />
        </div>

        <a
          href="https://github.com/Keltoummalouki"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-12 text-black dark:text-white hover:text-purple-400 dark:hover:text-fuchsia-400 transition-colors"
        >
          <Github /> Voir mon profil GitHub
        </a>
      </div>
    </section>
  )
}
