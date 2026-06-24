'use client'

import { useState, useTransition } from 'react'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown, Check } from 'lucide-react'

const languages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'fr', name: 'Français', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
] as const

export default function LanguageSwitcher() {
    const locale = useLocale()
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const currentLang = languages.find(l => l.code === locale) || languages[1]

    const handleLanguageChange = (langCode: string) => {
        startTransition(() => {
            document.cookie = `locale=${langCode};path=/;max-age=31536000`

            const lang = languages.find(l => l.code === langCode)
            if (lang) {
                document.documentElement.dir = lang.dir
                document.documentElement.lang = langCode
            }

            window.location.reload()
        })
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-card hover:bg-secondary transition-colors duration-200 min-h-[44px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-expanded={isOpen}
                disabled={isPending}
            >
                <Globe size={16} className="text-primary" />
                <span className="text-sm font-medium hidden sm:inline">
                    {currentLang.name}
                </span>
                <span className="text-sm font-medium sm:hidden">
                    {currentLang.code.toUpperCase()}
                </span>
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 z-50 min-w-[160px] bg-card border border-border rounded-xl overflow-hidden shadow-lg"
                        >
                            {languages.map((lang) => (
                                <motion.button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 ${locale === lang.code
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-secondary'
                                        }`}
                                    whileHover={{ x: 2 }}
                                    disabled={isPending}
                                >
                                    <span className="font-medium">{lang.name}</span>
                                    {locale === lang.code && (
                                        <Check size={14} className="ml-auto text-primary" />
                                    )}
                                </motion.button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
