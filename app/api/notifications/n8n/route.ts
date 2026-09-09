import { NextResponse } from 'next/server'
import { forwardToN8n, webhookError, N8N_DASHBOARD_ALERT_WEBHOOK } from '@/lib/n8n'

const notificationTypes = ['renewal_reminder', 'expiration_day', 'just_expired', 'camera_offline', 'camera_recovered', 'backup_missed', 'recovery_missed'] as const

export async function POST(request: Request) {
  const expected = process.env.N8N_NOTIFICATION_TOKEN
  if (expected && request.headers.get('authorization') !== `Bearer ${expected}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const payload = await request.json()
    if (!notificationTypes.includes(payload.type) || !Array.isArray(payload.recipients) || !payload.subject || !payload.message) return NextResponse.json({ error: 'Invalid notification payload', supportedTypes: notificationTypes }, { status: 400 })
    const forwarded = await forwardToN8n({
      type: payload.type,
      recipients: payload.recipients,
      subject: payload.subject,
      message: payload.message,
      metadata: payload.metadata ?? {},
    })
    return NextResponse.json({ ok: true, forwarded: true, webhook: N8N_DASHBOARD_ALERT_WEBHOOK, notificationType: payload.type, recipientCount: payload.recipients.length, forwardedAt: new Date().toISOString(), n8nResponse: forwarded.result })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    return webhookError(error)
  }
}

export async function GET() { return NextResponse.json({ endpoint: '/api/notifications/n8n', method: 'POST', supportedTypes: notificationTypes, required: ['type', 'recipients', 'subject', 'message'], forwardsTo: N8N_DASHBOARD_ALERT_WEBHOOK }) }
