'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const educationItems = [
	{
		id: 'youcode',
		icon: GraduationCap,
		color: 'from-[#3B82F6] to-[#1E40AF]',
		highlights: ['Full Stack Development', 'Agile Methodology', 'Project-Based Learning'],
	},
	{
		id: 'bac',
		icon: BookOpen,
		color: 'from-[#3B82F6] to-[#60A5FA]',
		highlights: ['Mathematics', 'Physics', 'Computer Science'],
	},
]

export default function EducationSection() {
	const t = useTranslations('education')
	const sectionRef = useRef<HTMLElement>(null)

	useEffect(() => {
		const ctx = gsap.context(() => {
			gsap.fromTo(
				'.education-card',
				{ opacity: 0, y: 50, rotateX: -10 },
				{
					opacity: 1,
					y: 0,
					rotateX: 0,
					duration: 0.8,
					stagger: 0.2,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: sectionRef.current,
						start: 'top 75%',
					}
				}
			)
		}, sectionRef)

		return () => ctx.revert()
	}, [])

	return (
		<section
			id="education"
			ref={sectionRef}
			className="relative py-24 overflow-hidden"
		>
			{/* Background */}
			<div className="absolute inset-0 opacity-[0.02]" style={{
				backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
				backgroundSize: '60px 60px'
			}} />
			<div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl" />

			<div className="relative max-w-4xl mx-auto px-6">
				{/* Header */}
				<div className="text-center mb-16">
					<motion.span
						className="inline-block px-4 py-2 rounded-full border border-[#27272A] text-sm font-medium text-[#3B82F6] mb-4"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						{t('subtitle')}
					</motion.span>

					<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
						<span className="gradient-text">{t('title')}</span>
					</h2>

					<div className="w-24 h-1 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] mx-auto rounded-full" />
				</div>

				{/* Education Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{educationItems.map((item) => {
						const Icon = item.icon

						return (
							<motion.div
								key={item.id}
								className="education-card group relative p-6 rounded-2xl glass-card hover-lift overflow-hidden"
								style={{ perspective: '1000px' }}
								whileHover={{ y: -5 }}
							>
								{/* Gradient Overlay */}
								<div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

								{/* Icon */}
								<div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${item.color} mb-4`}>
									<Icon className="w-8 h-8 text-white" />
								</div>

								{/* Content */}
								<h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-[#3B82F6] transition-colors">
									{t(`items.${item.id}.title`)}
								</h3>

								<p className="text-sm text-[#3B82F6] font-medium mb-1">
									{t(`items.${item.id}.school`)}
								</p>

								<p className="text-sm text-muted-foreground mb-4">
									{t(`items.${item.id}.date`)}
								</p>

								<p className="text-muted-foreground mb-4">
									{t(`items.${item.id}.description`)}
								</p>

								{/* Highlights */}
								<div className="flex flex-wrap gap-2">
									{item.highlights.map((highlight) => (
										<span
											key={highlight}
											className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
										>
											{highlight}
										</span>
									))}
								</div>

								{/* Decorative Element */}
								<div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
							</motion.div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
