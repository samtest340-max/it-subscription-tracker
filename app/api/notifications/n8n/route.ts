import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notificationSettings } from '@/lib/db/schema'
import { sendResendEmail } from '@/lib/resend'

const notificationTypes = ['renewal_reminder', 'expiration_day', 'just_expired', 'camera_offline', 'camera_recovered', 'backup_missed', 'recovery_missed'] as const

export async function POST(request: Request) {
  const expected = process.env.N8N_NOTIFICATION_TOKEN
  if (expected && request.headers.get('authorization') !== `Bearer ${expected}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const payload = await request.json()
    if (!notificationTypes.includes(payload.type) || !Array.isArray(payload.recipients) || !payload.subject || !payload.message) return NextResponse.json({ error: 'Invalid notification payload', supportedTypes: notificationTypes }, { status: 400 })
    const session = await auth.api.getSession({ headers: request.headers }); if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const [settings] = await db.select().from(notificationSettings).limit(1); const configured = Array.isArray(settings?.subscriptionAlertEmails) ? settings.subscriptionAlertEmails.filter((email): email is string => typeof email === 'string' && email.includes('@')) : []; const recipients = payload.recipients.length ? payload.recipients : configured; if (!recipients.length) return NextResponse.json({ error: 'No notification recipients configured.' }, { status: 400 }); await sendResendEmail({ to: recipients, subject: payload.subject, html: `<h2>${payload.subject}</h2><p>${payload.message}</p>` }); return NextResponse.json({ ok: true, sent: true, notificationType: payload.type, recipientCount: recipients.length, sentAt: new Date().toISOString() })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    console.error('[v0] notification email failed', error); return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to send notification email.' }, { status: 502 })
  }
}

export async function GET() { return NextResponse.json({ endpoint: '/api/notifications/n8n', method: 'POST', supportedTypes: notificationTypes, provider: 'resend', required: ['type', 'recipients', 'subject', 'message'] }) }
