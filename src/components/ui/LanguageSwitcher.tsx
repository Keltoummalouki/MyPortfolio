'use client'

import { useState, useTransition } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check } from 'lucide-react'

const languages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'fr', name: 'Français', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
] as const

export default function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const currentLang = languages.find(l => l.code === locale) || languages[1]

    const handleLanguageChange = (langCode: string) => {
        // Navigate to the same page under the new locale prefix. next-intl also
        // updates the `locale` preference cookie. The server re-renders with the
        // correct `lang`/`dir`.
        startTransition(() => {
            router.replace(pathname, { locale: langCode })
        })
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary transition-colors duration-200"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                aria-expanded={isOpen}
                aria-label={`${currentLang.name} — change language`}
                title={currentLang.name}
                disabled={isPending}
            >
                <Globe size={18} className="text-primary" />
                <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-background px-1 text-[9px] font-bold uppercase leading-tight text-muted-foreground ring-1 ring-border">
                    {currentLang.code}
                </span>
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
