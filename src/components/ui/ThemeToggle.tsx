"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative rounded-full hover:bg-secondary transition-colors duration-200"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex items-center justify-center"
      >
        <Sun className="h-[1.15rem] w-[1.15rem] transition-all dark:-rotate-90 dark:opacity-0" />
        <Moon className="absolute h-[1.15rem] w-[1.15rem] rotate-90 opacity-0 transition-all dark:rotate-0 dark:opacity-100" />
      </motion.div>
    </Button>
  )
}
