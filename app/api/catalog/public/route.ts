import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { catalogSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { defaults, getCatalog, joinCatalog, publicRows } from '@/lib/catalog'
export async function GET() { const [stored] = await db.select().from(catalogSettings).limit(1); const settings = stored ?? defaults; const data = await getCatalog(); const columns = (settings.visibleColumns as any[]) ?? defaults.visibleColumns; return NextResponse.json({ settings: { title: settings.title, subtitle: settings.subtitle, logoUrl: settings.logoUrl, footerText: settings.footerText, accentColor: settings.accentColor, noindex: settings.noindex, visibleColumns: columns }, rows: publicRows(joinCatalog(data), settings), fetchedAt: data.fetchedAt, error: data.error }, { headers: { 'Cache-Control': 'no-store' } }) }
