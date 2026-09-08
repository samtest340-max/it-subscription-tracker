import { NextResponse } from 'next/server'

const missedAfterHours = 12
const weeklyGraceDays = 2

export async function POST(request: Request) {
  const expected = process.env.N8N_NOTIFICATION_TOKEN
  if (expected && request.headers.get('authorization') !== `Bearer ${expected}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const payload = await request.json()
    if (!['daily_backup', 'weekly_recovery'].includes(payload.type) || !payload.scheduledFor || !payload.status) return NextResponse.json({ error: 'type, scheduledFor, and status are required' }, { status: 400 })
    return NextResponse.json({ ok: true, accepted: true, missedRule: payload.type === 'daily_backup' ? `after ${missedAfterHours} hours from WAT day start` : `after ${weeklyGraceDays} days from WAT week end`, receivedAt: new Date().toISOString() })
  } catch (error) {
    console.error('[v0] backup event error:', error)
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}

export async function GET() { return NextResponse.json({ endpoint: '/api/backups', method: 'POST', timezone: 'Africa/Lagos', dailyMissedAfterHours: missedAfterHours, weeklyMissedAfterDays: weeklyGraceDays }) }
