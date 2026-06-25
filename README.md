# 🚀 Keltoum Malouki - Portfolio

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Three.js](https://img.shields.io/badge/Three.js-r182-black?style=for-the-badge&logo=three.js)

A modern, animated portfolio website built with cutting-edge web technologies featuring 3D graphics, smooth animations, and multilingual support.

[Live Demo](https://www.keltoummalouki.com/) • [LinkedIn](https://www.linkedin.com/in/keltoum-malouki-79a28029a/) • [GitHub](https://github.com/Keltoummalouki)

</div>

---

## ✨ Features

### 🎨 Design & Animations
- **3D Interactive Background** - Immersive Three.js animated particles
- **GSAP Animations** - Smooth scroll-triggered animations throughout
- **Framer Motion** - Fluid micro-interactions and transitions
- **Dark Theme** - Premium dark UI with blue accent colors
- **Responsive Design** - Fully optimized for all device sizes

### 🌍 Internationalization
- **Multilingual Support** - Available in:
  - 🇬🇧 English
  - 🇫🇷 French (Français)
  - 🇸🇦 Arabic (العربية)

### 📧 Contact Integration
- **EmailJS Integration** - Backend-less contact form
- **Form Validation** - Real-time client-side validation
- **Feedback States** - Loading, success, and error messages

### 📊 Dynamic Content
- **GitHub Stats** - Live GitHub activity integration
- **Animated Counters** - Scroll-triggered statistics
- **Interactive Project Cards** - Hover effects and detailed views

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, CSS Variables |
| **3D Graphics** | Three.js, React Three Fiber, Drei |
| **Animations** | GSAP, Framer Motion |
| **Icons** | Lucide React, React Icons |
| **i18n** | next-intl |
| **Email** | EmailJS |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main page component
├── components/
│   ├── layouts/           # Header, Footer
│   ├── sections/          # Page sections
│   │   ├── Hero.tsx       # Hero with 3D background
│   │   ├── AboutSection.tsx
│   │   ├── CompetenceSection.tsx
│   │   ├── EducationSection.tsx
│   │   ├── ExperienceSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── GithubStatsSection.tsx
│   │   └── ContactSection.tsx
│   ├── three/             # Three.js components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
└── i18n.ts               # Internationalization config

messages/                  # Translation files
├── en.json               # English
├── fr.json               # French
└── ar.json               # Arabic

public/
├── images/               # Static images
└── cv.pdf                # Downloadable CV
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Keltoummalouki/MyPortfolio.git
   cd MyPortfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local   # then fill in real values
   ```
   [`.env.example`](.env.example) is the source of truth for every variable and documents which are **public** (`NEXT_PUBLIC_*`, embedded in the browser bundle) versus **server-only secrets** (never prefixed `NEXT_PUBLIC_`, never imported into a Client Component — e.g. `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`). `.env.local` is gitignored.

   > The contact form currently also reads `NEXT_PUBLIC_EMAILJS_*` (service / template / public key) until the Supabase-backed inbox replaces it.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests once (Vitest) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Run unit tests with a coverage report |

> **Testing scope.** `npm test` covers pure logic only (validation schemas, content mapping) and needs **no Supabase project or credentials**. Supabase **RLS integration tests require the local Supabase stack** (`supabase start`) and are introduced in M2 — they are not part of `npm test`.

---

## 🎯 Sections Overview

| Section | Description |
|---------|-------------|
| **Hero** | Introduction with 3D particle background, profile photo, and CTAs |
| **About** | Bio, animated stats, journey timeline, and personal qualities |
| **Skills** | Technical competencies organized by category with SVG icons |
| **Education** | Academic background and certifications |
| **Experience** | Professional experience and internships |
| **Projects** | Featured projects with images, tech stack, and links |
| **GitHub Stats** | Live GitHub contribution statistics |
| **Contact** | Contact form with EmailJS integration |

---

## 🌐 Deployment

This project is configured for seamless deployment on **Vercel**:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables (if using EmailJS)
4. Deploy!

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👋 Contact

**Keltoum Malouki** - Full Stack Developer

- 📧 Email: [keltoummalouki@gmail.com](mailto:keltoummalouki@gmail.com)
- 💼 LinkedIn: [Keltoum Malouki](https://www.linkedin.com/in/keltoum-malouki-79a28029a/)
- 🐙 GitHub: [@Keltoummalouki](https://github.com/Keltoummalouki)
- 📍 Location: Casablanca, Morocco

---

<div align="center">

**⭐ If you found this portfolio helpful, please consider giving it a star!**

Made with ❤️ by Keltoum Malouki

</div>
