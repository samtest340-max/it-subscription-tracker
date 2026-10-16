"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Camera, ClipboardList, Database, DatabaseBackup, Gauge, LayoutDashboard, Palette, Settings, ShieldCheck, Users, X } from "lucide-react"

const items = [
  ["/", "Overview", LayoutDashboard], ["/subscriptions", "Subscriptions", ClipboardList], ["/cameras", "Camera status", Camera], ["/branding-requests", "Branding requests", Palette], ["/onboarding", "Onboarding Page Manager", Users], ["/catalog-manager", "Catalog Manager", Database], ["/backups", "Backup & recovery", DatabaseBackup], ["/uptime", "Website uptime", Gauge], ["/admin", "Admin center", ShieldCheck], ["/settings", "Settings", Settings],
] as const

export function DashboardSidebar({ open, desktopOpen = true, onClose }: { open: boolean; desktopOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const [allowedPages, setAllowedPages] = useState<string[] | null>(null)
  useEffect(() => { fetch("/api/account/access", { cache: "no-store" }).then((response) => response.ok ? response.json() : { allPages: true }).then((access) => setAllowedPages(access.allPages ? items.map(([, label]) => label) : access.pages)).catch(() => setAllowedPages(items.map(([, label]) => label))) }, [])
  const visibleItems = allowedPages === null ? items : items.filter(([, label]) => allowedPages.includes(label))
  return <>
    {open && onClose && <button aria-label="Close menu" onClick={onClose} className="fixed inset-0 z-40 bg-[#16252c]/25 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 top-0 z-50 flex h-screen w-[238px] -translate-x-full flex-col overflow-hidden border-r border-[#164d55] bg-[#0b3038] shadow-[2px_0_28px_rgba(8,45,55,.28)] backdrop-blur-2xl transition-transform duration-300 ${desktopOpen ? "lg:translate-x-0 lg:pointer-events-auto" : "lg:-translate-x-full lg:pointer-events-none"} ${open ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"}`}>
      <div className="flex h-20 shrink-0 items-center border-b border-white/10 px-5"><img src="/farm-alert-logo.png" alt="Farm Alert" className="h-12 w-full object-contain object-left" /></div>
      <nav aria-label="Workspace navigation" className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4"><p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#8bb5b5]">Workspace</p>{visibleItems.map(([href, label, Icon]) => { const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`group tactile-control flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold outline-none transition-all duration-200 focus-visible:border-[#176b71] focus-visible:ring-2 focus-visible:ring-[#9edfd0] ${active ? "bg-[#dff3ed] text-[#176b71] shadow-[0_8px_18px_rgba(23,107,113,.12)]" : "text-[#c2d8d8] hover:-translate-y-0.5 hover:border-[#3d7278] hover:bg-[#164852] hover:text-white hover:shadow-[0_10px_22px_rgba(0,0,0,.16)]"}`}><span className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? "bg-white/80" : "bg-[#f4f7f7] group-hover:bg-[#e9f7f3]"}`}><Icon size={17} aria-hidden="true" /></span><span className="min-w-0 truncate">{label}</span>{active && <span className="ml-auto size-1.5 rounded-full bg-[#176b71]" aria-hidden="true" />}</Link> })}</nav>
    </aside>
  </>
}

export function useSidebarState() {
  const [open, setOpen] = useState(true)
  return { open, setOpen }
}

export function SidebarCloseButton({ onClick }: { onClick: () => void }) { return <button onClick={onClick} aria-label="Close sidebar" className="rounded-xl p-2 text-[#176b71] hover:bg-[#dff3ed] lg:hidden"><X size={19} /></button> }
