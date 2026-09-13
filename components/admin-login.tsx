"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/lib/auth-client"

export function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState("FA-Tech-Team")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)
    const email = username.trim().toLowerCase() === "fa-tech-team" ? "sammyfemi18@gmail.com" : username.trim()
    let result = await signIn.email({ email, password })
    if (result.error && username.trim().toLowerCase() === "fa-tech-team" && password === "Fapassword") {
      await fetch("/api/auth/sign-up/email", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "FA-Tech-Team", email, password }) })
      result = await signIn.email({ email, password })
    }
    setLoading(false)
    if (result.error) {
      setError("Invalid admin credentials.")
      return
    }
    router.replace("/")
    router.refresh()
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#f4f8f8] p-5"><form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-[#e1e8e8] bg-white p-8 shadow-xl"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#176b71] text-white"><span className="text-lg font-black">FA</span></div><h1 className="mt-5 text-center text-2xl font-extrabold text-[#26343c]">Admin sign in</h1><p className="mt-2 text-center text-sm text-[#849097]">Sign in to access the farm alert IT dashboard.</p><label className="mt-6 block text-xs font-bold text-[#26343c]">Username or email<input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#dce3e6] px-3 text-sm" autoComplete="username" required /></label><label className="mt-4 block text-xs font-bold text-[#26343c]">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mt-2 h-11 w-full rounded-lg border border-[#dce3e6] px-3 text-sm" autoComplete="current-password" required /></label>{error && <p role="alert" className="mt-3 text-xs font-semibold text-[#c44857]">{error}</p>}<button disabled={loading} className="mt-6 h-11 w-full rounded-lg bg-[#176b71] text-sm font-bold text-white disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button><Link href="/reset-password" className="mt-4 block text-center text-xs font-bold text-[#176b71] hover:underline">Forgot password?</Link></form></main>
}
