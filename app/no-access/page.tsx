import Link from "next/link"

export default async function NoAccessPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const page = params.page || "this page"
  return <main className="flex min-h-screen items-center justify-center bg-[#f7fbfa] p-6"><section className="w-full max-w-md rounded-3xl border border-[#dcebe6] bg-white p-8 text-center shadow-xl"><p className="text-xs font-black uppercase tracking-[.16em] text-[#176b71]">Workspace access</p><h1 className="mt-3 text-3xl font-extrabold text-[#26343c]">Access not available</h1><p className="mt-3 text-sm leading-6 text-[#718089]">Your administrator has not selected access to {page}. Ask an administrator to update your page permissions.</p><Link href="/" className="mt-6 inline-flex rounded-xl bg-[#176b71] px-5 py-3 text-sm font-bold text-white">Return to dashboard</Link></section></main>
}
