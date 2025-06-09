import Hero from "@/components/sections/Hero"
import AboutSection from "@/components/sections/AboutSection"
import CompetenceSection from "@/components/sections/CompetenceSection"
import ProjectsSection from "@/components/sections/ProjectsSection"
import ContactSection from "@/components/sections/ContactSection"
import Header from "@/components/layouts/Header"
import EducationSection from "@/components/sections/EducationSection"
import ExperienceSection from "@/components/sections/ExperienceSection"
import GitHubStats from "@/components/sections/GithubStatsSection"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <AboutSection />
      <CompetenceSection />
      <EducationSection/>
      <ExperienceSection/>
      <ProjectsSection />
      <GitHubStats/>
      <ContactSection />
    </main>
  )
}
