'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Heart, Code } from 'lucide-react'

export default function Footer() {
    const t = useTranslations('footer')
    const currentYear = new Date().getFullYear()

    const socialLinks = [
        {
            name: 'GitHub',
            href: 'https://github.com/Keltoummalouki',
            icon: Github
        },
        {
            name: 'LinkedIn',
            href: 'https://www.linkedin.com/in/keltoum-malouki-79a28029a/',
            icon: Linkedin
        },
        {
            name: 'Email',
            href: 'mailto:keltoummalouki@gmail.com',
            icon: Mail
        }
    ]

    return (
        <footer className="relative py-12 bg-gradient-to-t from-[#0A0A0B] to-[#111113] border-t border-[#27272A]">
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
                backgroundSize: '60px 60px'
            }} />

            <div className="relative max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Logo & Copyright */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center md:text-left"
                    >
                        <h3 className="text-2xl font-bold gradient-text mb-2">
                            Keltoum Malouki
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            © {currentYear} {t('copyright')}
                        </p>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-4"
                    >
                        {socialLinks.map((link) => (
                            <motion.a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full border border-[#27272A] hover:border-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all duration-300"
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label={link.name}
                            >
                                <link.icon size={20} className="text-gray-600 dark:text-gray-400" />
                            </motion.a>
                        ))}
                    </motion.div>

                    {/* Made with love */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                        <span>{t('madeWith')}</span>
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <Heart size={16} className="text-[#3B82F6] fill-[#3B82F6]" />
                        </motion.span>
                        <span>{t('and')}</span>
                        <Code size={16} className="text-[#3B82F6]" />
                    </motion.div>
                </div>

                {/* Tech Stack */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 pt-6 border-t border-[#27272A] text-center"
                >
                    <p className="text-xs text-muted-foreground">
                        Built with Next.js, TypeScript, Tailwind CSS, GSAP, Three.js & Framer Motion
                    </p>
                </motion.div>
            </div>
        </footer>
    )
}
