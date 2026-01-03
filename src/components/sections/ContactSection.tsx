'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2, Sparkles, MessageSquare, AlertCircle } from 'lucide-react'
// EmailJS library for sending emails directly from the frontend (no backend required)
import emailjs from '@emailjs/browser'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// =============================================================================
// EMAILJS CONFIGURATION
// =============================================================================
// To set up EmailJS:
// 1. Create a free account at https://www.emailjs.com/
// 2. Add an email service (Gmail, Outlook, etc.) in "Email Services"
// 3. Create an email template in "Email Templates" with these variables:
//    - {{from_name}} - sender's name
//    - {{from_email}} - sender's email  
//    - {{message}} - the message content
// 4. Get your Public Key from "Account" > "General" > "Public Key"
// 5. Replace the placeholders below with your actual IDs
// =============================================================================

const EMAILJS_CONFIG = {
  // Your EmailJS service ID (found in Email Services section)
  SERVICE_ID: 'service_6qfjw87',
  // Your EmailJS template ID (found in Email Templates section)
  TEMPLATE_ID: 'template_trl9bs6',
  // Your EmailJS public key (found in Account > General)
  PUBLIC_KEY: 'PdYxZNmjMU6xRfoxj',
}

// Form validation types
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

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Floating label input component with validation
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
}) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const hasValue = value.length > 0
  const isFloating = isFocused || hasValue

  const InputComponent = rows ? 'textarea' : 'input'

  return (
    <div className="relative group">
      {/* Floating Label */}
      <motion.label
        htmlFor={id}
        className={`absolute left-4 pointer-events-none transition-all duration-300 ${isFloating
          ? `text-xs top-2 ${error ? 'text-red-500' : 'text-[#3B82F6]'}`
          : 'text-sm text-muted-foreground top-4'
          }`}
        animate={{
          y: isFloating ? 0 : 0,
          scale: isFloating ? 0.85 : 1,
        }}
      >
        {label}
        {required && <span className={error ? 'text-red-500 ml-1' : 'text-[#3B82F6] ml-1'}>*</span>}
      </motion.label>

      {/* Input/Textarea */}
      <InputComponent
        ref={inputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>}
        id={id}
        name={id}
        type={type}
        required={required}
        rows={rows}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={onChange}
        className={`w-full px-4 ${isFloating ? 'pt-6 pb-3' : 'py-4'} rounded-xl bg-[#111113] border-2 transition-all duration-300 focus:outline-none resize-none ${error
          ? 'border-red-500 focus:border-red-500'
          : isFocused
            ? 'border-[#3B82F6] shadow-lg shadow-[#3B82F6]/10 scale-[1.01]'
            : 'border-[#27272A] hover:border-[#60A5FA]'
          }`}
        placeholder={isFloating ? placeholder : ''}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
      />

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-500 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle size={14} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Focus ring effect */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{
          boxShadow: isFocused
            ? error
              ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
              : '0 0 0 4px rgba(59, 130, 246, 0.1)'
            : '0 0 0 0px rgba(59, 130, 246, 0)',
        }}
        transition={{ duration: 0.2 }}
      />
    </div>
  )
}

export default function ContactSection() {
  const t = useTranslations('contact')
  const sectionRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate contact cards with stagger
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

      // Animate form with a slight delay
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
  }, [])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission with EmailJS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // =============================================================================
      // EMAILJS SEND EMAIL
      // =============================================================================
      // The send() method takes:
      // - serviceId: Your email service ID
      // - templateId: Your email template ID
      // - templateParams: Object with variables matching your template
      // - publicKey: Your EmailJS public key
      // =============================================================================
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          // You can add more template variables here if needed
          to_name: 'Keltoum', // Your name (recipient)
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      )

      // Success! Clear form and show success message
      setSubmitStatus('success')
      setFormData({ name: '', email: '', message: '' })

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000)

    } catch (error) {
      // Handle error
      console.error('EmailJS Error:', error)
      setSubmitStatus('error')

      // Set user-friendly error message
      if (error instanceof Error) {
        setErrorMessage(error.message || 'Failed to send message. Please try again.')
      } else {
        setErrorMessage('Failed to send message. Please try again.')
      }

      // Reset error state after 5 seconds
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
      color: 'from-[#3B82F6] to-[#1E40AF]',
    },
    {
      icon: Phone,
      label: t('info.phone'),
      value: '+212 606 232 697',
      href: 'tel:+212606232697',
      color: 'from-[#3B82F6] to-[#60A5FA]',
    },
    {
      icon: MapPin,
      label: t('info.location'),
      value: 'Casablanca, Morocco',
      href: null,
      color: 'from-[#64748B] to-[#94A3B8]',
    },
  ]

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#3B82F6]/5 rounded-full blur-3xl float" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-[#3B82F6]/5 rounded-full blur-3xl float-delayed" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#27272A] text-sm font-medium text-[#3B82F6] mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <MessageSquare size={16} />
            {t('info.email')}
          </motion.span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">{t('title')}</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('subtitle')}
          </p>

          <div className="w-24 h-1 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] mx-auto rounded-full" />
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactInfo.map((info) => {
            const Icon = info.icon
            const Component = info.href ? 'a' : 'div'

            return (
              <motion.div
                key={info.label}
                className="contact-card"
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Component
                  href={info.href || undefined}
                  className="block p-6 rounded-2xl glass-card hover-lift group text-center relative overflow-hidden"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                  <motion.div
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${info.color} mb-4 shadow-lg`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>

                  <p className="text-sm text-muted-foreground mb-1">{info.label}</p>
                  <p className="font-medium text-foreground group-hover:text-[#3B82F6] transition-colors">
                    {info.value}
                  </p>
                </Component>
              </motion.div>
            )
          })}
        </div>

        {/* Contact Form */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="p-8 rounded-3xl glass-card relative overflow-hidden"
            noValidate // Disable browser validation, we handle it ourselves
          >
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#3B82F6]/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#3B82F6]/5 rounded-full blur-3xl" />

            <div className="relative space-y-6">
              {/* Name Field */}
              <FloatingLabelInput
                id="name"
                label={t('form.name')}
                placeholder={t('form.namePlaceholder')}
                required
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />

              {/* Email Field */}
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

              {/* Message Field */}
              <FloatingLabelInput
                id="message"
                label={t('form.message')}
                placeholder={t('form.messagePlaceholder')}
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                error={errors.message}
              />

              {/* Error Message Banner */}
              <AnimatePresence>
                {submitStatus === 'error' && errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3"
                    role="alert"
                  >
                    <AlertCircle size={20} />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || submitStatus === 'success'}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] text-white font-semibold shadow-lg hover:shadow-[#3B82F6]/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-500 relative overflow-hidden group"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

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
                      <span>Sending...</span>
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
                      <Sparkles size={16} className="text-yellow-300" />
                    </motion.span>
                  ) : submitStatus === 'error' ? (
                    <motion.span
                      key="error"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="relative flex items-center justify-center gap-2"
                    >
                      <AlertCircle size={20} />
                      <span>Try Again</span>
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
