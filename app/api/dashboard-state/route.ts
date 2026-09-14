import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cameras, subscriptions, backupEvents } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return null
  return session.user.id
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (body.type === 'camera') {
    const camera = body.camera ?? {}
    const [created] = await db.insert(cameras).values({ userId, station: String(camera.station ?? 'Unknown'), cameraName: String(camera.name ?? 'Camera'), cameraId: String(camera.id ?? crypto.randomUUID()), location: String(camera.location ?? ''), status: String(camera.status ?? 'offline') }).returning()
    return NextResponse.json({ camera: created }, { status: 201 })
  }
  if (body.type === 'backup') {
    const event = body.event ?? {}
    const [created] = await db.insert(backupEvents).values({ userId, backupType: String(event.type ?? 'Daily backup'), scheduledFor: new Date(event.scheduledFor ?? Date.now()), completedAt: event.completedAt ? new Date(event.completedAt) : new Date(), status: String(event.status ?? 'completed').toLowerCase(), provider: String(event.provider ?? 'Manual / n8n'), notes: event.notes ? String(event.notes) : null }).returning()
    return NextResponse.json({ backup: created }, { status: 201 })
  }
  return NextResponse.json({ error: 'Unsupported state type' }, { status: 400 })
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [subscriptionRows, cameraRows, backupRows] = await Promise.all([
    db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt)),
    db.select().from(cameras).where(eq(cameras.userId, userId)).orderBy(desc(cameras.createdAt)),
    db.select().from(backupEvents).where(eq(backupEvents.userId, userId)).orderBy(desc(backupEvents.createdAt)),
  ])
  return NextResponse.json({ subscriptions: subscriptionRows, cameras: cameraRows, backups: backupRows }, { headers: { 'Cache-Control': 'no-store' } })
}
