import { getLocale } from "next-intl/server"
import HeroSection from "@/components/sections/HeroSection"
import AboutSection from "@/components/sections/AboutSection"
import SkillsSection from "@/components/sections/SkillsSection"
import ExperienceSection from "@/components/sections/ExperienceSection"
import EducationSection from "@/components/sections/EducationSection"
import ProjectsSection from "@/components/sections/ProjectsSection"
import CertificationsSection from "@/components/sections/CertificationsSection"
import GithubStatsSection from "@/components/sections/GithubStatsSection"
import ContactSection from "@/components/sections/ContactSection"
import Header from "@/components/layouts/Header"
import Footer from "@/components/layouts/Footer"
import ScrollProgress from "@/components/ui/ScrollProgress"
import { getPublishedProjects } from "@/features/content/projects.queries"
import { toProjectCard } from "@/features/content/projects.map"
import type { Locale } from "@/lib/validation/locale"

export default async function Home() {
  const locale = (await getLocale()) as Locale
  const projects = (await getPublishedProjects()).map((p) => toProjectCard(p, locale))

  return (
    <div className="min-h-screen relative">
      <ScrollProgress />
      <Header />

      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <EducationSection />
        <ProjectsSection projects={projects} />
        <CertificationsSection />
        <GithubStatsSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  )
}
