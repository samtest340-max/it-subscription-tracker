'use client'

const labels: Record<string, string> = { mission: 'Mission statement', vision: 'Vision statement', values: 'Core values' }

export function PublicOnboarding({ initialData }: { initialData: any }) {
  const data = initialData
  const error = ''

  if (error) return <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6] p-6"><div className="max-w-md rounded-3xl border border-[#dce6e2] bg-white p-8 text-center shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#176b71]">Farm Alert</p><h1 className="mt-3 text-2xl font-extrabold text-[#183b3b]">Link not valid</h1><p className="mt-2 text-sm leading-6 text-[#687a7a]">This onboarding link is no longer valid. Please ask your company contact for a new link.</p></div></main>
  if (!data) return <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6] text-sm text-[#687a7a]">Loading onboarding page…</main>
  if (data.offline) return <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6] p-6"><div className="rounded-3xl border border-[#dce6e2] bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-extrabold text-[#183b3b]">This page is currently unavailable</h1><p className="mt-2 text-sm text-[#687a7a]">Please check back later or contact your onboarding administrator.</p></div></main>

  const { page, identity, documents, blocks } = data
  return <main className="min-h-screen bg-[#f7f9f8] text-[#203b3b]">
    <header className="relative overflow-hidden bg-[#073f43] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(71,190,135,0.28),transparent_45%)]" />
      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-7 sm:px-10 lg:pb-24">
        <div className="flex items-center justify-between gap-5">
          <div className="flex min-h-14 items-center rounded-2xl bg-white px-4 py-2 shadow-lg shadow-black/10">{page.logoUrl ? <img src={page.logoUrl} alt={`${page.companyName} logo`} className="max-h-12 w-auto max-w-[220px] object-contain" /> : <span className="text-lg font-extrabold text-[#073f43]">{page.companyName}</span>}</div>
          <span className="hidden rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/75 sm:block">New team member guide</span>
        </div>
        <div className="max-w-3xl pt-16 sm:pt-20"><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8de0ae]">{page.companyName}</p><h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">{page.headline}</h1>{page.tagline && <p className="mt-5 text-lg text-white/75">{page.tagline}</p>}</div>
      </div>
    </header>

    <div className="mx-auto -mt-8 max-w-6xl px-6 pb-16 sm:px-10">
      <section className="rounded-3xl border border-[#dce6e2] bg-white p-7 shadow-xl shadow-[#174745]/8 sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#176b71]">A warm welcome</p><h2 className="mt-3 text-2xl font-extrabold text-[#183b3b] sm:text-3xl">We&apos;re glad you&apos;re here.</h2><p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-8 text-[#617272]">{page.welcomeMessage}</p></section>

      {identity.length > 0 && <section className="mt-14"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#176b71]">Who we are</p><h2 className="mt-2 text-3xl font-extrabold text-[#183b3b]">Our identity</h2></div><div className="grid gap-5 md:grid-cols-3">{identity.map((item: any) => <article key={item.id} className="overflow-hidden rounded-2xl border border-[#dce6e2] bg-white shadow-sm">{item.imageUrl && <img src={item.imageUrl} alt={labels[item.itemType] ?? item.itemType} className="h-48 w-full object-cover" />}<div className="p-6"><h3 className="text-lg font-extrabold text-[#183b3b]">{labels[item.itemType] ?? item.itemType}</h3>{item.caption && <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#687a7a]">{item.caption}</p>}</div></article>)}</div></section>}

      <section className="mt-14"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#176b71]">Information &amp; resources</p><h2 className="mt-2 text-3xl font-extrabold text-[#183b3b]">Everything you need to get started</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#687a7a]">Review and download the resources prepared for your first days with the team.</p></div><div className="grid gap-4 md:grid-cols-2">{documents.length ? documents.map((document: any) => <a key={document.id} href={document.fileUrl} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-5 rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#8dc9ac] hover:shadow-md"><span className="flex min-w-0 items-center gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e9f5ee] text-lg text-[#176b71]">↗</span><span className="min-w-0"><strong className="block truncate text-sm font-extrabold text-[#183b3b]">{document.title}</strong>{document.description && <span className="mt-1 block text-xs leading-5 text-[#687a7a]">{document.description}</span>}</span></span><span className="shrink-0 text-xs font-bold text-[#176b71]">Open</span></a>) : <div className="rounded-2xl border border-dashed border-[#cbdad4] bg-white p-8 text-sm text-[#687a7a]">Resources will appear here when they are published.</div>}</div></section>

      {blocks.length > 0 && <section className="mt-14 grid gap-5 md:grid-cols-2">{blocks.map((block: any) => <article key={block.id} className="rounded-2xl border border-[#dce6e2] bg-[#edf7f0] p-7"><h3 className="text-lg font-extrabold text-[#183b3b]">{block.title}</h3><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#617272]">{block.content}</p></article>)}</section>}
      <footer className="mt-16 border-t border-[#dce6e2] pt-6 text-xs text-[#849391]">{page.companyName} · Onboarding information for new team members</footer>
    </div>
  </main>
}

export default PublicOnboarding
