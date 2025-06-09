"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ContactSection() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const contactInfoRef = useRef<HTMLDivElement>(null)
  const formRef = useRef(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const contactInfo = contactInfoRef.current
    const form = formRef.current

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        end: "bottom 15%",
      },
    })

    tl.fromTo(
      title,
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
    )
      .fromTo(
        contactInfo ? Array.from(contactInfo.children) : [],
        { opacity: 0, y: 30, rotateX: -15 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
        "-=0.4",
      )
      .fromTo(
        form,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power2.out" },
        "-=0.3",
      )

    // Animation de background flottant
    gsap.to(".floating-orb", {
      y: "random(-20, 20)",
      x: "random(-10, 10)",
      rotation: "random(-5, 5)",
      duration: "random(3, 6)",
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      stagger: {
        amount: 2,
        from: "random",
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-24 bg-white dark:bg-black text-black dark:text-white"
    >
      {/* Orbes flottants décoratifs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-orb absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="floating-orb absolute top-40 right-20 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-xl"></div>
        <div className="floating-orb absolute bottom-32 left-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="floating-orb absolute bottom-20 right-1/3 w-28 h-28 bg-purple-400/10 rounded-full blur-xl"></div>
      </div>

      {/* Grille de fond subtile */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative max-w-6xl mx-auto px-4">
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-600 bg-clip-text text-transparent leading-tight">
            Contactez-moi
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-black dark:text-white max-w-2xl mx-auto leading-relaxed">
            Vous souhaitez discuter d&apos;un projet ou d&apos;une opportunité ? N&apos;hésitez pas à me contacter via ce formulaire ou
            directement par mes coordonnées ci-dessous.
          </p>
        </div>

        {/* Informations de contact avec glassmorphism */}
        <div ref={contactInfoRef} className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Mail,
              text: "keltoummalouki@gmail.com",
              label: "Email",
            },
            {
              icon: Phone,
              text: "+212 606 232 697",
              label: "Téléphone",
            },
            {
              icon: MapPin,
              text: "Casablanca, Maroc",
              label: "Localisation",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-white dark:bg-black/80 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:bg-white/10 dark:hover:bg-black/90"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 group-hover:from-purple-500/30 group-hover:to-fuchsia-500/30 transition-all duration-300">
                  <item.icon
                    className="text-purple-400 group-hover:text-purple-300 transition-colors duration-300"
                    size={24}
                  />
                </div>
                <div>
                  <p className="text-sm text-black dark:text-white mb-1">{item.label}</p>
                  <p className="text-black dark:text-white font-medium">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Formulaire amélioré */}
        <div className="max-w-2xl mx-auto">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="relative p-8 rounded-3xl bg-white dark:bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 rounded-3xl"></div>

            <div className="relative space-y-6">
              {/* Champ Nom */}
              <div className="relative">
                <label htmlFor="name" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Nom complet
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 rounded-xl bg-white dark:bg-black/60 backdrop-blur-sm text-black dark:text-white placeholder-gray-400 border transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                    focusedField === "name"
                      ? "border-purple-400 shadow-lg shadow-purple-500/25 bg-white/10 dark:bg-black/80"
                      : "border-white/20 hover:border-white/30"
                  }`}
                  placeholder="Votre nom complet"
                />
              </div>

              {/* Champ Email */}
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 rounded-xl bg-white dark:bg-black/60 backdrop-blur-sm text-black dark:text-white placeholder-gray-400 border transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                    focusedField === "email"
                      ? "border-purple-400 shadow-lg shadow-purple-500/25 bg-white/10 dark:bg-black/80"
                      : "border-white/20 hover:border-white/30"
                  }`}
                  placeholder="votre@email.com"
                />
              </div>

              {/* Champ Message */}
              <div className="relative">
                <label htmlFor="message" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 rounded-xl bg-white dark:bg-black/60 backdrop-blur-sm text-black dark:text-white placeholder-gray-400 border transition-all duration-300 focus:outline-none focus:scale-[1.02] resize-none ${
                    focusedField === "message"
                      ? "border-purple-400 shadow-lg shadow-purple-500/25 bg-white/10 dark:bg-black/80"
                      : "border-white/20 hover:border-white/30"
                  }`}
                  placeholder="Décrivez votre projet ou votre demande..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitted}
                className="group relative w-full py-4 px-6 rounded-xl bg-white dark:bg-black text-black dark:text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  {isSubmitted ? (
                    <>
                      <CheckCircle size={20} />
                      <span>Message envoyé !</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
