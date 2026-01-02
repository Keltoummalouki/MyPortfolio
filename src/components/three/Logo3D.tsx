'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

// Wireframe Icosahedron - the core of the logo
function CoreShape({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const edgesRef = useRef<THREE.LineSegments>(null)

    useFrame((state) => {
        if (!meshRef.current || !edgesRef.current) return

        const time = state.clock.getElapsedTime()

        // Smooth rotation with mouse influence
        meshRef.current.rotation.x = time * 0.2 + mouse.current.y * 0.5
        meshRef.current.rotation.y = time * 0.3 + mouse.current.x * 0.5
        edgesRef.current.rotation.x = meshRef.current.rotation.x
        edgesRef.current.rotation.y = meshRef.current.rotation.y

        // Subtle scale pulse
        const scale = 1 + Math.sin(time * 2) * 0.03
        meshRef.current.scale.setScalar(scale)
        edgesRef.current.scale.setScalar(scale)
    })

    const geometry = new THREE.IcosahedronGeometry(1, 1)
    const edges = new THREE.EdgesGeometry(geometry)

    return (
        <group>
            {/* Inner solid with low opacity */}
            <mesh ref={meshRef} geometry={geometry}>
                <meshBasicMaterial
                    color="#3B82F6"
                    transparent
                    opacity={0.05}
                />
            </mesh>

            {/* Wireframe edges */}
            <lineSegments ref={edgesRef} geometry={edges}>
                <lineBasicMaterial color="#3B82F6" linewidth={2} />
            </lineSegments>
        </group>
    )
}

// Orbiting particles representing technologies
function OrbitingParticles({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
    const groupRef = useRef<THREE.Group>(null)
    const particleCount = 12

    const particles = useMemo(() => {
        return Array.from({ length: particleCount }, (_, i) => {
            const angle = (i / particleCount) * Math.PI * 2
            const radius = 1.8 + Math.random() * 0.5
            const speed = 0.3 + Math.random() * 0.2
            const offset = Math.random() * Math.PI * 2
            const isBlue = i % 3 === 0

            return { angle, radius, speed, offset, isBlue }
        })
    }, [])

    useFrame((state) => {
        if (!groupRef.current) return

        const time = state.clock.getElapsedTime()

        groupRef.current.rotation.x = mouse.current.y * 0.3
        groupRef.current.rotation.y = mouse.current.x * 0.3

        groupRef.current.children.forEach((child, i) => {
            const particle = particles[i]
            const currentAngle = particle.angle + time * particle.speed + particle.offset

            child.position.x = Math.cos(currentAngle) * particle.radius
            child.position.y = Math.sin(currentAngle * 0.5) * 0.5
            child.position.z = Math.sin(currentAngle) * particle.radius
        })
    })

    return (
        <group ref={groupRef}>
            {particles.map((particle, i) => (
                <mesh key={i} position={[0, 0, 0]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshBasicMaterial
                        color={particle.isBlue ? '#60A5FA' : '#3B82F6'}
                        transparent
                        opacity={0.9}
                    />
                </mesh>
            ))}
        </group>
    )
}

// Connecting lines between core and particles
function ConnectingLines({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
    const linesRef = useRef<THREE.Group>(null)
    const lineCount = 6

    useFrame((state) => {
        if (!linesRef.current) return

        const time = state.clock.getElapsedTime()

        linesRef.current.rotation.x = time * 0.1 + mouse.current.y * 0.2
        linesRef.current.rotation.y = time * 0.15 + mouse.current.x * 0.2

        linesRef.current.children.forEach((child, i) => {
            const line = child as THREE.Line
            const opacity = 0.2 + Math.sin(time * 2 + i) * 0.1
                ; (line.material as THREE.LineBasicMaterial).opacity = opacity
        })
    })

    const lines = useMemo(() => {
        return Array.from({ length: lineCount }, (_, i) => {
            const angle = (i / lineCount) * Math.PI * 2
            const endX = Math.cos(angle) * 2
            const endZ = Math.sin(angle) * 2

            const points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(endX, 0, endZ)
            ]

            return new THREE.BufferGeometry().setFromPoints(points)
        })
    }, [])

    return (
        <group ref={linesRef}>
            {lines.map((geometry, i) => (
                <line key={i} geometry={geometry}>
                    <lineBasicMaterial
                        color={i % 2 === 0 ? '#3B82F6' : '#60A5FA'}
                        transparent
                        opacity={0.2}
                    />
                </line>
            ))}
        </group>
    )
}

// Main scene combining all elements
function LogoScene({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />

            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
                <group scale={0.8}>
                    <CoreShape mouse={mouse} />
                    <OrbitingParticles mouse={mouse} />
                    <ConnectingLines mouse={mouse} />
                </group>
            </Float>
        </>
    )
}

// Main exported component
export default function Logo3D({ className = '' }: { className?: string }) {
    const mouseRef = useRef({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2

        mouseRef.current = { x, y }
    }

    return (
        <div
            className={`relative ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                mouseRef.current = { x: 0, y: 0 }
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <LogoScene mouse={mouseRef} />
            </Canvas>
        </div>
    )
}
