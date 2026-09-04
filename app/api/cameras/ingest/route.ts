import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cameras, cameraReadings, cameraIncidents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  const token = request.headers.get('x-n8n-token')
  if (!process.env.N8N_WEBHOOK_SECRET || token !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body.cameraId !== 'string' || typeof body.observedAt !== 'string') {
    return NextResponse.json({ error: 'cameraId and observedAt are required' }, { status: 400 })
  }

  const camera = await db.query.cameras.findFirst({ where: eq(cameras.cameraId, body.cameraId) })
  if (!camera) return NextResponse.json({ error: 'Camera not found' }, { status: 404 })

  const observedAt = new Date(body.observedAt)
  if (Number.isNaN(observedAt.getTime())) return NextResponse.json({ error: 'Invalid observedAt' }, { status: 400 })
  const isOnline = body.online === true || body.status === 'online'

  await db.insert(cameraReadings).values({ cameraId: camera.id, observedAt, payload: body })
  await db.update(cameras).set({ lastSeenAt: observedAt, status: isOnline ? 'online' : 'offline', updatedAt: new Date() }).where(eq(cameras.id, camera.id))
  if (!isOnline) {
    await db.insert(cameraIncidents).values({ cameraId: camera.id, incidentType: 'offline', startedAt: observedAt })
  }

  return NextResponse.json({ ok: true, status: isOnline ? 'online' : 'offline' })
}

export async function GET() {
  return NextResponse.json({ service: 'farm alert IT camera ingestion', timezone: 'Africa/Lagos' })
}
