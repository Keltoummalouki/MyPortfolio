'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

// Enhanced Particle Field with scroll and mouse reactivity
function ParticleField({
    count = 4000,
    mouse,
    scrollProgress
}: {
    count?: number
    mouse: React.MutableRefObject<{ x: number; y: number }>
    scrollProgress: React.MutableRefObject<number>
}) {
    const ref = useRef<THREE.Points>(null)
    const initialPositions = useRef<Float32Array | null>(null)

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const sizes = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            // Create a more interesting spherical distribution
            const radius = Math.random() * 18 + 4
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos((Math.random() * 2) - 1)

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
            positions[i3 + 2] = radius * Math.cos(phi) - 10

            // New color palette: Blue, Light Blue, Slate (removing gold)
            const t = Math.random()
            if (t < 0.35) {
                // Electric Blue
                colors[i3] = 0.23
                colors[i3 + 1] = 0.51
                colors[i3 + 2] = 0.96
            } else if (t < 0.65) {
                // Light Blue
                colors[i3] = 0.38
                colors[i3 + 1] = 0.65
                colors[i3 + 2] = 0.98
            } else if (t < 0.85) {
                // Slate Gray
                colors[i3] = 0.58
                colors[i3 + 1] = 0.64
                colors[i3 + 2] = 0.69
            } else {
                // White accent
                colors[i3] = 0.95
                colors[i3 + 1] = 0.95
                colors[i3 + 2] = 0.95
            }

            // Varied sizes for depth
            sizes[i] = Math.random() * 0.5 + 0.3
        }

        return { positions, colors, sizes }
    }, [count])

    // Store initial positions for scroll effect
    useEffect(() => {
        initialPositions.current = particles.positions.slice()
    }, [particles.positions])

    useFrame((state) => {
        if (!ref.current || !initialPositions.current) return

        const time = state.clock.getElapsedTime()
        const scroll = scrollProgress.current
        const positions = ref.current.geometry.attributes.position.array as Float32Array

        // Apply scroll-based dispersion and mouse interaction
        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const ix = initialPositions.current[i3]
            const iy = initialPositions.current[i3 + 1]
            const iz = initialPositions.current[i3 + 2]

            // Scroll dispersion - particles spread out as you scroll
            const dispersion = scroll * 2
            positions[i3] = ix * (1 + dispersion * 0.3) + Math.sin(time * 0.5 + i * 0.01) * 0.2
            positions[i3 + 1] = iy * (1 + dispersion * 0.2) + Math.cos(time * 0.3 + i * 0.01) * 0.3
            positions[i3 + 2] = iz - scroll * 15 // Move particles back on scroll
        }

        ref.current.geometry.attributes.position.needsUpdate = true

        // Gentle rotation influenced by mouse
        ref.current.rotation.x = time * 0.02 + mouse.current.y * 0.2
        ref.current.rotation.y = time * 0.03 + mouse.current.x * 0.2

        // Floating motion
        ref.current.position.y = Math.sin(time * 0.4) * 0.5
    })

    return (
        <Points ref={ref} positions={particles.positions} colors={particles.colors} stride={3}>
            <PointMaterial
                transparent
                vertexColors
                size={0.06}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.85}
            />
        </Points>
    )
}

// Floating geometric shapes with enhanced animations
function GeometricShapes({
    mouse,
    scrollProgress
}: {
    mouse: React.MutableRefObject<{ x: number; y: number }>
    scrollProgress: React.MutableRefObject<number>
}) {
    const groupRef = useRef<THREE.Group>(null)
    const shapesRef = useRef<THREE.Mesh[]>([])

    const shapes = useMemo(() => [
        { geometry: 'icosahedron', position: [-8, 4, -15], scale: 1.2, color: '#3B82F6' },
        { geometry: 'octahedron', position: [7, -3, -18], scale: 1, color: '#60A5FA' },
        { geometry: 'tetrahedron', position: [-5, -5, -12], scale: 0.8, color: '#94A3B8' },
        { geometry: 'dodecahedron', position: [6, 5, -20], scale: 0.9, color: '#3B82F6' },
        { geometry: 'icosahedron', position: [0, -6, -16], scale: 0.7, color: '#60A5FA' },
        { geometry: 'octahedron', position: [-7, 0, -22], scale: 1.1, color: '#64748B' },
    ], [])

    useFrame((state) => {
        if (!groupRef.current) return

        const time = state.clock.getElapsedTime()
        const scroll = scrollProgress.current

        // Rotate group based on mouse and scroll
        groupRef.current.rotation.x = time * 0.05 + mouse.current.y * 0.15 + scroll * 0.5
        groupRef.current.rotation.y = time * 0.08 + mouse.current.x * 0.15 + scroll * 0.3

        // Animate individual shapes
        shapesRef.current.forEach((mesh, i) => {
            if (!mesh) return
            mesh.rotation.x = time * (0.1 + i * 0.02)
            mesh.rotation.y = time * (0.15 + i * 0.03)
            mesh.position.y += Math.sin(time + i) * 0.002

            // Scale down on scroll
            const scaleMultiplier = 1 - scroll * 0.3
            mesh.scale.setScalar(shapes[i].scale * scaleMultiplier)
        })
    })

    const getGeometry = (type: string) => {
        switch (type) {
            case 'icosahedron': return <icosahedronGeometry args={[1, 0]} />
            case 'octahedron': return <octahedronGeometry args={[1, 0]} />
            case 'tetrahedron': return <tetrahedronGeometry args={[1, 0]} />
            case 'dodecahedron': return <dodecahedronGeometry args={[1, 0]} />
            default: return <icosahedronGeometry args={[1, 0]} />
        }
    }

    return (
        <group ref={groupRef}>
            {shapes.map((shape, i) => (
                <Float
                    key={i}
                    speed={1.5}
                    rotationIntensity={0.5}
                    floatIntensity={0.5}
                >
                    <mesh
                        ref={(el) => { if (el) shapesRef.current[i] = el }}
                        position={shape.position as [number, number, number]}
                        scale={shape.scale}
                    >
                        {getGeometry(shape.geometry)}
                        <meshBasicMaterial
                            color={shape.color}
                            wireframe
                            transparent
                            opacity={0.4}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    )
}

// Glowing orb in the center
function GlowingOrb({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
    const ref = useRef<THREE.Mesh>(null)
    const glowRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!ref.current || !glowRef.current) return
        const time = state.clock.getElapsedTime()
        const scroll = scrollProgress.current

        // Pulsing effect
        const pulse = 1 + Math.sin(time * 2) * 0.15
        ref.current.scale.setScalar(pulse * (1 - scroll * 0.5))
        glowRef.current.scale.setScalar(pulse * 1.5 * (1 - scroll * 0.5))

        // Fade on scroll
        const material = ref.current.material as THREE.MeshBasicMaterial
        const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial
        material.opacity = 0.15 * (1 - scroll)
        glowMaterial.opacity = 0.08 * (1 - scroll)
    })

    return (
        <group position={[0, 0, -18]}>
            <mesh ref={glowRef}>
                <sphereGeometry args={[5, 32, 32]} />
                <meshBasicMaterial
                    color="#3B82F6"
                    transparent
                    opacity={0.05}
                />
            </mesh>
            <mesh ref={ref}>
                <sphereGeometry args={[3, 32, 32]} />
                <meshBasicMaterial
                    color="#3B82F6"
                    transparent
                    opacity={0.1}
                />
            </mesh>
        </group>
    )
}

// Floating code symbols
function FloatingSymbols({
    mouse,
    scrollProgress
}: {
    mouse: React.MutableRefObject<{ x: number; y: number }>
    scrollProgress: React.MutableRefObject<number>
}) {
    const groupRef = useRef<THREE.Group>(null)

    const symbols = useMemo(() => [
        { text: '</>', position: [-10, 6, -20] as [number, number, number] },
        { text: '{ }', position: [9, 4, -18] as [number, number, number] },
        { text: '=>', position: [-8, -4, -16] as [number, number, number] },
        { text: '( )', position: [7, -5, -22] as [number, number, number] },
        { text: '[]', position: [0, 7, -24] as [number, number, number] },
    ], [])

    useFrame((state) => {
        if (!groupRef.current) return
        const time = state.clock.getElapsedTime()
        const scroll = scrollProgress.current

        groupRef.current.children.forEach((child, i) => {
            child.position.y = symbols[i].position[1] + Math.sin(time + i * 0.5) * 0.5
            child.rotation.y = time * 0.2

            // Fade out on scroll
            if (child instanceof THREE.Mesh) {
                const material = child.material as THREE.MeshBasicMaterial
                if (material.opacity !== undefined) {
                    material.opacity = 0.3 * (1 - scroll * 1.5)
                }
            }
        })

        // Mouse influence
        groupRef.current.rotation.x = mouse.current.y * 0.1
        groupRef.current.rotation.y = mouse.current.x * 0.1
    })

    return (
        <group ref={groupRef}>
            {symbols.map((symbol, i) => (
                <Float key={i} speed={2} floatIntensity={1} rotationIntensity={0.3}>
                    <mesh position={symbol.position}>
                        <planeGeometry args={[2, 1]} />
                        <meshBasicMaterial
                            color="#a855f7"
                            transparent
                            opacity={0.3}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    )
}

// Main scene component
function Scene({
    mouse,
    scrollProgress
}: {
    mouse: React.MutableRefObject<{ x: number; y: number }>
    scrollProgress: React.MutableRefObject<number>
}) {
    const { camera } = useThree()

    useEffect(() => {
        camera.position.z = 5
    }, [camera])

    useFrame(() => {
        // Subtle camera movement based on scroll
        const scroll = scrollProgress.current
        camera.position.z = 5 + scroll * 3
        camera.position.y = scroll * 2
    })

    return (
        <>
            <ambientLight intensity={0.5} />
            <ParticleField mouse={mouse} scrollProgress={scrollProgress} />
            <GeometricShapes mouse={mouse} scrollProgress={scrollProgress} />
            <GlowingOrb scrollProgress={scrollProgress} />
            <FloatingSymbols mouse={mouse} scrollProgress={scrollProgress} />
        </>
    )
}

export default function ThreeBackground() {
    const mouseRef = useRef({ x: 0, y: 0 })
    const scrollRef = useRef(0)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return

            const rect = containerRef.current.getBoundingClientRect()
            mouseRef.current = {
                x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
                y: -((e.clientY - rect.top) / rect.height) * 2 + 1
            }
        }

        const handleScroll = () => {
            // Calculate scroll progress (0 to 1 for first viewport)
            const scrollY = window.scrollY
            const viewportHeight = window.innerHeight
            scrollRef.current = Math.min(scrollY / viewportHeight, 1)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="three-canvas-container"
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                background: 'transparent'
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
                style={{ background: 'transparent' }}
            >
                <Scene mouse={mouseRef} scrollProgress={scrollRef} />
            </Canvas>
        </div>
    )
}
