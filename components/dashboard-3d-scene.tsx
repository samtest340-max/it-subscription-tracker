"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshDistortMaterial, OrbitControls } from "@react-three/drei"
import { useRef } from "react"
import type { Mesh } from "three"

function Orb({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.12 })
  return <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.35}><mesh ref={ref} position={position} scale={scale}><icosahedronGeometry args={[1, 1]} /><MeshDistortMaterial color={color} roughness={0.8} metalness={0.05} distort={0.2} speed={1.2} transparent opacity={0.34} /></mesh></Float>
}

export function Dashboard3DScene({ interactive = false }: { interactive?: boolean }) {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 hidden opacity-80 lg:block"><Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 8], fov: 42 }} frameloop="always"><ambientLight intensity={1.2} /><Orb position={[-4, 2.7, -2]} color="#79cdbd" scale={1.6} /><Orb position={[4.4, -1.4, -1]} color="#b4dfe4" scale={1.1} /><Orb position={[2.8, 3.2, -3]} color="#d4c6a4" scale={0.7} />{interactive && <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.15} />}</Canvas></div>
}

export function ThreeFallback() { return <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_85%_12%,rgba(211,244,237,.5),transparent_28%)]" /> }
