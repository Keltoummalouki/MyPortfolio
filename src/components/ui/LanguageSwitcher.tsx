'use client'

import { useState, useTransition } from 'react'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown } from 'lucide-react'

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦', dir: 'rtl' },
] as const

export default function LanguageSwitcher() {
    const locale = useLocale()
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const currentLang = languages.find(l => l.code === locale) || languages[1]

    const handleLanguageChange = (langCode: string) => {
        startTransition(() => {
            // Set cookie for locale
            document.cookie = `locale=${langCode};path=/;max-age=31536000`

            // Set document direction
            const lang = languages.find(l => l.code === langCode)
            if (lang) {
                document.documentElement.dir = lang.dir
                document.documentElement.lang = langCode
            }

            // Reload to apply changes
            window.location.reload()
        })
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full glass hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Change language"
                disabled={isPending}
            >
                <Globe size={18} className="text-purple-500" />
                <span className="text-sm font-medium hidden sm:inline">
                    {currentLang.flag} {currentLang.code.toUpperCase()}
                </span>
                <span className="text-sm font-medium sm:hidden">
                    {currentLang.flag}
                </span>
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full mt-2 z-50 min-w-[160px] glass-card rounded-xl overflow-hidden shadow-xl"
                        >
                            {languages.map((lang) => (
                                <motion.button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 ${locale === lang.code
                                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    whileHover={{ x: 4 }}
                                    disabled={isPending}
                                >
                                    <span className="text-xl">{lang.flag}</span>
                                    <span className="font-medium">{lang.name}</span>
                                    {locale === lang.code && (
                                        <motion.div
                                            layoutId="activeLanguage"
                                            className="ml-auto w-2 h-2 rounded-full bg-purple-500"
                                        />
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
