"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"

function derivePriceInfo(priceList: unknown) {
  const value = String(priceList ?? "").trim()
  const lower = value.toLowerCase()
  const type = lower.includes("retail") ? "Retail" : lower.includes("wholesale") ? "Wholesale" : "Unmapped"
  const state = (value.split("_")[0] || value.split(/retail|wholesale/i)[0] || "Unmapped").trim().replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
  return { state, type }
}

const money = (value: unknown, currency = "NGN") => {
  if (value === "" || value == null || Number.isNaN(Number(value))) return "—"
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value))
}

export function PublicCatalog() {
  const [data, setData] = useState<any>(null)
  const [query, setQuery] = useState("")
  const [state, setState] = useState("")
  const [priceFilter, setPriceFilter] = useState<"All" | "Retail" | "Wholesale">("All")
  const [priceListFilter, setPriceListFilter] = useState("All")
  const [group, setGroup] = useState("All")

  useEffect(() => {
    fetch("/api/catalog/public", { cache: "no-store" }).then((response) => response.json()).then((next) => {
      setData(next)
      setState("ABUJA")
    })
  }, [])

  const settings = data?.settings
  const states = useMemo(() => { const derived = (data?.rows ?? []).map((row: any) => row.state || derivePriceInfo(row.price_list).state).filter(Boolean); const configured = settings?.stateOrder?.filter((item: string) => settings.visibleStates?.includes(item)) ?? []; return [...new Set(configured.length ? configured : (settings?.visibleStates?.length ? settings.visibleStates : derived))] }, [data, settings])
  const groups = useMemo(() => [...new Set((data?.rows ?? []).map((row: any) => row.item_group).filter(Boolean))], [data])
  const priceLists = useMemo(() => [...new Set((data?.rows ?? []).map((row: any) => String(row.price_list ?? "").trim()).filter(Boolean))].sort(), [data])
  const products = useMemo(() => {
    const map = new Map<string, any>()
    for (const row of data?.rows ?? []) {
      const priceInfo = { state: row.state || derivePriceInfo(row.price_list).state, type: row.priceType || derivePriceInfo(row.price_list).type }
      if (state && priceInfo.state !== state) continue
      if (group !== "All" && row.item_group !== group) continue
      if (priceListFilter !== "All" && String(row.price_list ?? "") !== priceListFilter) continue
      if (query && !Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase())) continue
      const key = String(row.item_code || row.item_name || row.name)
      const product = map.get(key) ?? { ...row, prices: {} }
      const type = priceInfo.type === "Retail" || priceInfo.type === "Wholesale" ? priceInfo.type : "Unmapped"
      if (priceFilter !== "All" && type !== priceFilter) continue
      const next = { value: row.price_list_rate, currency: row.currency || "NGN", priceList: String(row.price_list ?? ""), date: String(row.valid_from || row.modified || "") }
      const previous = product.prices[type]
      if (!previous || next.date > previous.date) product.prices[type] = next
      map.set(key, product)
    }
    return [...map.values()]
  }, [data, group, priceFilter, priceListFilter, query, settings, state])

  if (!data) return <main className="min-h-screen bg-[#eef6f4] p-6"><div className="mx-auto max-w-6xl animate-pulse rounded-3xl bg-white/70 p-16" /></main>

  return <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#c7f0df,transparent_35%),linear-gradient(135deg,#eef7f5,#f6f8f7)] px-4 py-8 text-[#173b45] md:px-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#57a58f]">Farm Alert catalog</p><h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">{settings.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#6e858b]">{settings.subtitle}</p></div>{settings.logoUrl && <img src={settings.logoUrl} alt="Catalog logo" className="h-14 max-w-40 object-contain" />}</div>
        <div className="mt-6 flex flex-col gap-3 md:flex-row"><label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#dceae5] bg-white/80 px-4 py-3"><Search size={18} className="shrink-0 text-[#57a58f]" /><span className="sr-only">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, categories, or codes" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><label className="flex items-center gap-2 rounded-2xl border border-[#dceae5] bg-white/80 px-4 py-3 text-sm"><SlidersHorizontal size={16} /><span className="sr-only">Filter category</span><select value={group} onChange={(event) => setGroup(event.target.value)} className="bg-transparent font-semibold outline-none"><option>All</option>{groups.map((item) => <option key={String(item)}>{String(item)}</option>)}</select></label></div>
      </header>
      <section className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 rounded-2xl border border-[#dceae5] bg-white/80 px-4 py-3 text-sm"><span className="font-semibold text-[#668084]">State</span><select value={state} onChange={(event) => setState(event.target.value)} className="max-w-40 bg-transparent font-semibold outline-none"><option value="">All states</option>{states.map((item: string) => <option key={item} value={item}>{item}</option>)}</select></label><label className="flex items-center gap-2 rounded-2xl border border-[#dceae5] bg-white/80 px-4 py-3 text-sm"><span className="font-semibold text-[#668084]">Price list</span><select value={priceListFilter} onChange={(event) => setPriceListFilter(event.target.value)} className="max-w-48 bg-transparent font-semibold outline-none"><option value="All">All price lists</option>{priceLists.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-black uppercase tracking-[.16em] text-[#8aa09e]">Prices</span>{(["All", "Retail", "Wholesale"] as const).map((item) => <button key={item} onClick={() => setPriceFilter(item)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${priceFilter === item ? "border-[#176b71] bg-[#dff3ed] text-[#176b71]" : "border-[#dceae5] bg-white/70 text-[#6e858b] hover:border-[#9bd2bd]"}`}>{item}</button>)}</div></section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <article key={String(product.item_code || product.item_name || product.name)} className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-[0_12px_35px_rgba(31,70,90,.08)]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#8aa09e]">{product.item_group || "Product"}</p><h2 className="mt-1 text-lg font-black text-[#173b45]">{product.item_name || product.name}</h2></div>{product.stock_uom && <span className="rounded-full bg-[#eef7f5] px-2 py-1 text-[11px] font-bold text-[#668084]">{product.stock_uom}</span>}</div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#f5fbf8] p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-[#7d9692]">Retail</p><p className="mt-1 text-base font-black text-[#176b71]">{money(product.prices.Retail?.value, product.prices.Retail?.currency)}</p><p className="mt-1 truncate text-[10px] text-[#7d9692]" title={product.prices.Retail?.priceList}>price_list_rate: {product.prices.Retail?.value ?? "—"}</p></div><div className="rounded-2xl bg-[#fff8ec] p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-[#a78352]">Wholesale</p><p className="mt-1 text-base font-black text-[#9b6b22]">{money(product.prices.Wholesale?.value, product.prices.Wholesale?.currency)}</p><p className="mt-1 truncate text-[10px] text-[#a78352]" title={product.prices.Wholesale?.priceList}>price_list_rate: {product.prices.Wholesale?.value ?? "—"}</p></div></div></article>)}</section>
      {!products.length && <div className="rounded-3xl border border-dashed border-[#b8d9ce] bg-white/60 p-12 text-center text-sm text-[#6e858b]">No products match the selected state and filters.</div>}
      <footer className="pt-4 text-center text-xs text-[#7d9692]">{settings.footerText}</footer>
    </div>
  </main>
}

export default PublicCatalog
