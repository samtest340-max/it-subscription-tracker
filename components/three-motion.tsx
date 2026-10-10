"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

export function MotionCard({ children, className = "", disabled = false }: { children: ReactNode; className?: string; disabled?: boolean }) {
  const reduced = useReducedMotion()
  return <motion.div className={className} whileHover={disabled || reduced ? undefined : { y: -5, rotateX: 1.5, rotateY: -1.5, boxShadow: "0 24px 60px rgba(23,107,113,.16)" }} transition={{ duration: 0.22, ease: "easeOut" }} style={{ transformStyle: "preserve-3d" }}>{children}</motion.div>
}

export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  return <motion.span className={className} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>{value}</motion.span>
}
