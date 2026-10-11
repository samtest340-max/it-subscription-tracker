"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Camera, ClipboardList, Database, DatabaseBackup, Gauge, LayoutDashboard, Palette, Settings, ShieldCheck, Users, X } from "lucide-react"

const items = [
  ["/", "Overview", LayoutDashboard], ["/subscriptions", "Subscriptions", ClipboardList], ["/cameras", "Camera status", Camera], ["/branding-requests", "Branding requests", Palette], ["/onboarding", "Onboarding Page Manager", Users], ["/catalog-manager", "Catalog Manager", Database], ["/backups", "Backup & recovery", DatabaseBackup], ["/uptime", "Website uptime", Gauge], ["/admin", "Admin center", ShieldCheck], ["/settings", "Settings", Settings],
] as const

export function DashboardSidebar({ open, desktopOpen = true, onClose }: { open: boolean; desktopOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  return <>
    {open && onClose && <button aria-label="Close menu" onClick={onClose} className="fixed inset-0 z-30 bg-[#16252c]/25 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 top-20 z-40 flex h-[calc(100dvh-5rem)] w-[238px] -translate-x-full flex-col overflow-hidden border-r border-white/60 bg-white/70 shadow-[2px_0_28px_rgba(31,70,90,.08)] backdrop-blur-2xl transition-transform duration-300 ${desktopOpen ? "lg:translate-x-0" : "lg:-translate-x-full lg:pointer-events-none"} ${open ? "translate-x-0" : "pointer-events-none"}`}>
      <div className="flex h-20 shrink-0 items-center border-b border-[#edf0f2] px-5"><img src="/farm-alert-logo.png" alt="Farm Alert" className="h-12 w-full object-contain object-left" /></div>
      <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4"><p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#9aa5ab]">Workspace</p>{items.map(([href, label, Icon]) => <Link key={href} href={href} onClick={onClose} className={`tactile-control flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${pathname === href ? "bg-[#dff3ed] text-[#176b71]" : "text-[#74818a] hover:bg-white/90 hover:text-[#176b71] hover:shadow-[0_8px_18px_rgba(31,70,90,.10)]"}`}><Icon size={17} className="shrink-0" /><span className="min-w-0 truncate">{label}</span></Link>)}</nav>
    </aside>
  </>
}

export function useSidebarState() {
  const [open, setOpen] = useState(true)
  return { open, setOpen }
}

export function SidebarCloseButton({ onClick }: { onClick: () => void }) { return <button onClick={onClick} aria-label="Close sidebar" className="rounded-xl p-2 text-[#176b71] hover:bg-[#dff3ed] lg:hidden"><X size={19} /></button> }
