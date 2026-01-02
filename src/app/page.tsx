import Hero from "@/components/sections/Hero"
import AboutSection from "@/components/sections/AboutSection"
import CompetenceSection from "@/components/sections/CompetenceSection"
import ProjectsSection from "@/components/sections/ProjectsSection"
import ContactSection from "@/components/sections/ContactSection"
import Header from "@/components/layouts/Header"
import Footer from "@/components/layouts/Footer"
import EducationSection from "@/components/sections/EducationSection"
import ExperienceSection from "@/components/sections/ExperienceSection"
import GitHubStats from "@/components/sections/GithubStatsSection"
import ScrollProgress from "@/components/ui/ScrollProgress"

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Navigation */}
      <Header />

      {/* Hero Section with Three.js Background */}
      <Hero />

      {/* About Section with Stats */}
      <AboutSection />

      {/* Skills/Competence Section */}
      <CompetenceSection />

      {/* Education Section */}
      <EducationSection />

      {/* Experience & Certifications Section */}
      <ExperienceSection />

      {/* Projects Section with 3D Cards */}
      <ProjectsSection />

      {/* GitHub Statistics */}
      <GitHubStats />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />
    </main>
  )
}
