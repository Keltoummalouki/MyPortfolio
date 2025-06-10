"use client"

import gsap from "gsap"
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Mail, Github, Linkedin, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(titleRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power4.out" })
    }
  }, [])

  return (
    <section className="min-h-screen w-full py-20 bg-white dark:bg-black text-black dark:text-white flex items-center">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
        <motion.div
          className="relative order-2 lg:order-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="w-[280px] h-[280px] rounded-full bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-blue-500/30 absolute -inset-4 blur-3xl animate-pulse" />
          <div className="w-[260px] h-[260px] rounded-full bg-gradient-to-br from-pink-400/20 to-purple-400/20 absolute -inset-2 blur-xl" />
          <Image
            src="/images/keltoum.jpg"
            alt="Keltoum Malouki"
            width={240}
            height={240}
            className="relative z-10 rounded-full border-4 border-white/20 shadow-2xl backdrop-blur-sm bg-white dark:bg-black"
          />
        </motion.div>

        <div className="text-center lg:text-left flex-1 order-1 lg:order-2 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4"
              ref={titleRef}
            >
              Keltoum
              <br />
              Malouki
            </h1>

            <p className="text-2xl md:text-3xl text-black dark:text-white mb-2 font-light">Développeuse Full Stack</p>

            <p className="text-lg text-black dark:text-white mb-8 max-w-lg mx-auto lg:mx-0">
              Passionnée par la création d&apos;expériences web modernes et performantes
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a
              href="mailto:keltoum@example.com"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black text-black dark:text-white hover:bg-white/20 hover:text-purple-600 dark:hover:bg-black/80 dark:hover:text-purple-400 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              <Mail size={18} />
              <span className="hidden sm:inline">Email</span>
            </a>
            <a
              href="https://github.com/Keltoummalouki"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black text-black dark:text-white hover:bg-white/20 hover:text-purple-600 dark:hover:bg-black/80 dark:hover:text-purple-400 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              <Github size={18} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/keltoum-malouki-79a28029a/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black text-black dark:text-white hover:bg-white/20 hover:text-purple-600 dark:hover:bg-black/80 dark:hover:text-purple-400 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              <Linkedin size={18} />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
          <a
          href="/cv.pdf"
          download
          target="_blank"
          rel="noopener noreferrer"
          >
          <Button
          size="lg"
          className="bg-white dark:bg-black text-black dark:text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
          <Download size={20} />
          Télécharger CV
          </Button>
          </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
