import { NextResponse } from 'next/server'

const notificationTypes = ['renewal_reminder', 'expiration_day', 'just_expired', 'camera_offline', 'camera_recovered', 'backup_missed', 'recovery_missed'] as const

export async function POST(request: Request) {
  const expected = process.env.N8N_NOTIFICATION_TOKEN
  if (expected && request.headers.get('authorization') !== `Bearer ${expected}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const payload = await request.json()
    if (!notificationTypes.includes(payload.type) || !Array.isArray(payload.recipients) || !payload.subject || !payload.message) return NextResponse.json({ error: 'Invalid notification payload', supportedTypes: notificationTypes }, { status: 400 })
    return NextResponse.json({ ok: true, accepted: true, notificationType: payload.type, recipientCount: payload.recipients.length, queuedAt: new Date().toISOString(), n8n: { next: 'Send this payload through Brevo using your SENDINBLUE_API_TOKEN credential.' } })
  } catch (error) {
    console.error('[v0] n8n notification request error:', error)
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}

export async function GET() { return NextResponse.json({ endpoint: '/api/notifications/n8n', method: 'POST', supportedTypes: notificationTypes, required: ['type', 'recipients', 'subject', 'message'] }) }
