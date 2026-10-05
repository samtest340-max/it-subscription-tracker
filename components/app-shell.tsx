"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, CalendarDays, Camera, ClipboardList, DatabaseBackup, Gauge, LayoutDashboard, Palette, Settings, ShieldCheck, Users, X } from "lucide-react"
import type { ReactNode } from "react"

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/subscriptions", label: "Subscriptions", icon: ClipboardList },
  { href: "/cameras", label: "Camera status", icon: Camera },
  { href: "/team", label: "Team & approvals", icon: Users },
  { href: "/branding-requests", label: "Branding requests", icon: Palette },
  { href: "/backups", label: "Backup & recovery", icon: DatabaseBackup },
  { href: "/uptime", label: "Website uptime", icon: Gauge },
  { href: "/admin", label: "Admin center", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function AppShell({ children, title = "Dashboard" }: { children: ReactNode; title?: string }) {
  const pathname = usePathname()
  return <div className="min-h-screen bg-[#f7f9fa] text-[#26343c]">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[238px] border-r border-[#e3e8eb] bg-white lg:block">
      <div className="flex h-20 items-center gap-3 border-b border-[#edf0f2] px-6"><div className="flex size-9 items-center justify-center rounded-xl bg-[#176b71] text-white"><ShieldCheck size={20}/></div><div><p className="text-[15px] font-extrabold tracking-tight">farm alert IT</p><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#91a0a7]">Operations hub</p></div></div>
      <nav className="flex flex-col gap-1 p-4"><p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#9aa5ab]">Workspace</p>{nav.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${pathname === href ? "bg-[#e9f4f3] text-[#176b71]" : "text-[#74818a] hover:bg-[#f5f7f8]"}`}><Icon size={17}/>{label}</Link>)} </nav>
      <div className="absolute bottom-5 left-4 right-4 rounded-xl bg-[#f0f6f5] p-3 text-xs text-[#668084]"><p className="font-bold text-[#176b71]">WAT timezone active</p><p className="mt-1">All expiry calculations use Africa/Lagos.</p></div>
    </aside>
    <main className="lg:pl-[238px]"><header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-[#e3e8eb] bg-white/95 px-5 backdrop-blur sm:px-8"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#9aa5ab]">{title}</p><h1 className="mt-1 text-xl font-extrabold tracking-tight">{title === "Dashboard" ? "Good Day, Team" : title}</h1></div><div className="flex items-center gap-3"><Link href="/settings" className="rounded-lg p-2 text-[#829099] hover:bg-[#f4f6f7]"><Bell size={18}/></Link><Link href="/admin" className="flex items-center gap-2 rounded-full border border-[#e3e8eb] bg-white px-2.5 py-1.5 text-xs font-bold"><span className="flex size-7 items-center justify-center rounded-full bg-[#dcefed] text-[#176b71]">SR</span><span className="hidden sm:inline">Sam Rivera</span></Link></div></header><div className="p-5 sm:p-8">{children}</div></main>
  </div>
}

export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) { return <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#176b71]">{eyebrow}</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#26343c]">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d8991]">{description}</p></div>{action}</div> }

export function SectionCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) { return <section className="rounded-2xl border border-[#e3e8eb] bg-white p-5 shadow-[0_1px_2px_rgba(20,35,50,.03)]"><div className="mb-5"><h3 className="font-bold">{title}</h3>{description && <p className="mt-1 text-xs text-[#8a969d]">{description}</p>}</div>{children}</section> }

export function StatusPill({ children, tone = "teal" }: { children: ReactNode; tone?: "teal" | "red" | "amber" | "slate" }) { const tones = { teal: "bg-[#e5f5ef] text-[#18765c]", red: "bg-[#fff0f1] text-[#c44857]", amber: "bg-[#fff5e4] text-[#a86b1b]", slate: "bg-[#f0f3f4] text-[#66757e]" }; return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>{children}</span> }

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14222a]/40 p-4"><div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><h3 className="text-xl font-extrabold">{title}</h3><button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-[#89959d] hover:bg-[#f2f5f6]"><X size={18}/></button></div>{children}</div></div> }

export const subscriptions = [{ name: "Microsoft 365 Business", category: "Productivity", owner: "IT Operations", expires: "Sep 08, 2026", cost: "$12,480", status: "Expiring Soon" }, { name: "CrowdStrike Falcon", category: "Security", owner: "Security Team", expires: "Sep 18, 2026", cost: "$8,250", status: "Active" }, { name: "GitHub Enterprise", category: "Dev Tools", owner: "Engineering", expires: "Oct 02, 2026", cost: "$6,800", status: "Active" }, { name: "Figma Organization", category: "Design", owner: "Product Design", expires: "Oct 21, 2026", cost: "$4,200", status: "Active" }, { name: "AWS Business Support", category: "Infrastructure", owner: "Platform Team", expires: "Aug 26, 2026", cost: "$19,800", status: "Expired" }]

export const cameras = [{ station: "North Field", camera: "Camera 01", id: "CAM-NF-001", location: "North perimeter", status: "Online", seen: "2 min ago", ip: "10.24.4.11", firmware: "v4.8.2", threshold: "10 minutes", incidents: 0 }, { station: "North Field", camera: "Camera 02", id: "CAM-NF-002", location: "Pump house", status: "Offline", seen: "18 min ago", ip: "10.24.4.12", firmware: "v4.8.2", threshold: "10 minutes", incidents: 2 }, { station: "Main Gate", camera: "Camera 03", id: "CAM-MG-003", location: "Entry gate", status: "Online", seen: "1 min ago", ip: "10.24.8.21", firmware: "v4.9.0", threshold: "10 minutes", incidents: 0 }, { station: "Main Gate", camera: "Camera 04", id: "CAM-MG-004", location: "Loading bay", status: "Offline", seen: "41 min ago", ip: "10.24.8.22", firmware: "v4.9.0", threshold: "10 minutes", incidents: 1 }]

export function EmptyNavHint() { return null }
