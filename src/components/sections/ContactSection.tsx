'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import GlassCard from '@/components/ui/GlassCard'
import TurnstileWidget from '@/components/ui/TurnstileWidget'
import { submitContactMessage } from '@/features/inbox/actions'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const MAX_MESSAGE_LENGTH = 2000

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

interface FormData {
  name: string
  email: string
  message: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function sanitizeInput(input: string): string {
  // Do not trim while the user is typing: trimming on every change removes
  // trailing spaces immediately, which makes the message textarea feel broken.
  return input.replace(/[<>]/g, '')
}

function FloatingLabelInput({
  id,
  type = 'text',
  label,
  placeholder,
  required = false,
  rows,
  value,
  onChange,
  error,
  maxLength,
}: {
  id: string
  type?: string
  label: string
  placeholder: string
  required?: boolean
  rows?: number
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
  maxLength?: number
}) {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value.length > 0
  const isFloating = isFocused || hasValue
  const InputComponent = rows ? 'textarea' : 'input'

  return (
    <div className="relative group">
      <motion.label
        htmlFor={id}
        className={cn(
          'absolute left-4 pointer-events-none transition-all duration-200 origin-left',
          isFloating
            ? `text-xs top-2 ${error ? 'text-destructive' : 'text-primary'}`
            : 'text-sm text-muted-foreground top-4'
        )}
      >
        {label}
        {required && <span className={cn('ml-1', error ? 'text-destructive' : 'text-primary')}>*</span>}
      </motion.label>

      <InputComponent
        id={id}
        name={id}
        type={type}
        required={required}
        rows={rows}
        value={value}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={onChange}
        className={cn(
          'w-full px-4 rounded-xl bg-secondary border-2 transition-all duration-200 focus:outline-none resize-none text-foreground placeholder:text-muted-foreground/50',
          isFloating ? 'pt-6 pb-3' : 'py-4',
          error
            ? 'border-destructive focus:border-destructive'
            : isFocused
              ? 'border-primary focus:ring-4 focus:ring-primary/10'
              : 'border-border hover:border-primary/50'
        )}
        placeholder={isFloating ? placeholder : ''}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
      />

      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-2 text-sm text-destructive flex items-center gap-1"
            role="alert"
          >
            <AlertCircle size={14} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ContactSection() {
  const t = useTranslations('contact')
  const tCommon = useTranslations('common')
  const sectionRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          }
        }
      )

      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 85%',
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value) }))

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    const name = formData.name.trim()
    const email = formData.email.trim()
    const message = formData.message.trim()

    if (!name) {
      newErrors.name = t('form.errors.nameRequired')
    } else if (name.length < 2) {
      newErrors.name = t('form.errors.nameMin')
    }

    if (!email) {
      newErrors.email = t('form.errors.emailRequired')
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = t('form.errors.emailInvalid')
    }

    if (!message) {
      newErrors.message = t('form.errors.messageRequired')
    } else if (message.length < 10) {
      newErrors.message = t('form.errors.messageMin')
    } else if (message.length > MAX_MESSAGE_LENGTH) {
      newErrors.message = t('form.errors.messageMax')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // If Turnstile is configured, require a token before submitting.
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setSubmitStatus('error')
      setErrorMessage(tCommon('error'))
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const result = await submitContactMessage({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        turnstileToken,
      })

      if (!result.ok) {
        throw new Error(result.error ?? 'server')
      }

      setSubmitStatus('success')
      setFormData({ name: '', email: '', message: '' })
      setTurnstileToken(null)

      setTimeout(() => setSubmitStatus('idle'), 5000)
    } catch {
      setSubmitStatus('error')
      // Show a generic, localized message — never surface raw server errors to users.
      setErrorMessage(tCommon('error'))

      setTimeout(() => {
        setSubmitStatus('idle')
        setErrorMessage('')
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      label: t('info.email'),
      value: 'keltoummalouki@gmail.com',
      href: 'mailto:keltoummalouki@gmail.com',
    },
    {
      icon: Phone,
      label: t('info.phone'),
      value: '+212 606 232 697',
      href: 'tel:+212606232697',
    },
    {
      icon: MapPin,
      label: t('info.location'),
      value: 'Casablanca, Morocco',
      href: null,
    },
  ]

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative section-padding overflow-hidden bg-background"
      aria-labelledby="contact-title"
    >
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container-main">
        <SectionHeader eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((info) => {
            const Icon = info.icon
            const content = (
              <>
                <div className="inline-flex p-4 rounded-xl bg-secondary text-primary mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{info.label}</p>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">{info.value}</p>
              </>
            )

            return (
              <div key={info.label} className="contact-card">
                <GlassCard className="p-6 text-center h-full group">
                  {info.href ? (
                    <a
                      href={info.href}
                      className="block"
                    >
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </GlassCard>
              </div>
            )
          })}
        </div>

        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="p-6 md:p-10 rounded-3xl glass-card relative overflow-hidden"
            noValidate
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative space-y-6">
              <FloatingLabelInput
                id="name"
                label={t('form.name')}
                placeholder={t('form.namePlaceholder')}
                required
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />

              <FloatingLabelInput
                id="email"
                type="email"
                label={t('form.email')}
                placeholder={t('form.emailPlaceholder')}
                required
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              <FloatingLabelInput
                id="message"
                label={t('form.message')}
                placeholder={t('form.messagePlaceholder')}
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                error={errors.message}
                maxLength={MAX_MESSAGE_LENGTH}
              />

              <TurnstileWidget onToken={setTurnstileToken} />

              <AnimatePresence>
                {submitStatus === 'error' && errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3"
                    role="alert"
                  >
                    <AlertCircle size={20} />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={isSubmitting || submitStatus === 'success'}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary to-violet-500 text-white font-semibold shadow-lg hover:shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden group"
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="relative flex items-center justify-center gap-2"
                    >
                      <Loader2 size={20} className="animate-spin" />
                      <span>{t('form.sending')}</span>
                    </motion.span>
                  ) : submitStatus === 'success' ? (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="relative flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      <span>{t('form.sent')}</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="send"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="relative flex items-center justify-center gap-2"
                    >
                      <Send size={20} />
                      <span>{t('form.send')}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
