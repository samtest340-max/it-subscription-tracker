import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { websiteUptimeStatus } from '@/lib/db/schema'

// n8n posts here directly; dashboard reads remain protected by the authenticated UI.
const defaultUserId = 'dashboard'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select().from(websiteUptimeStatus).where(eq(websiteUptimeStatus.userId, defaultUserId)).orderBy(desc(websiteUptimeStatus.receivedAt))
  const latest = Array.from(new Map(rows.map((row) => [row.websiteUrl, row])).values()).sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
  return NextResponse.json({ websites: latest })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const items = Array.isArray(body.websites) ? body.websites : [body]
    if (!items.length) return NextResponse.json({ error: 'At least one website status is required.' }, { status: 400 })
    const values = items.map((item) => {
      if (!item.name || !item.url || !item.status || !item.checkedAt) throw new Error('Each status requires name, url, status, and checkedAt.')
      return { userId: body.userId ?? defaultUserId, websiteName: String(item.name), websiteUrl: String(item.url), status: String(item.status).toLowerCase(), errorMessage: item.errorMessage ? String(item.errorMessage) : null, httpStatus: item.httpStatus == null ? null : Number(item.httpStatus), responseTimeMs: item.responseTimeMs == null ? null : Number(item.responseTimeMs), checkedAt: new Date(item.checkedAt) }
    })
    const inserted = await db.insert(websiteUptimeStatus).values(values).returning()
    return NextResponse.json({ ok: true, received: inserted.length, websites: inserted })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid uptime payload.' }, { status: 400 })
  }
}
