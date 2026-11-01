import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notificationSettings } from '@/lib/db/schema'
import { sendResendEmail } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const recipients = Array.isArray(payload.recipients)
      ? payload.recipients.filter((recipient: unknown) => typeof recipient === 'string' && recipient.includes('@'))
      : []

    if (!payload.softwareName || !payload.expirationDate) {
      return NextResponse.json({ error: 'softwareName and expirationDate are required' }, { status: 400 })
    }

    const session = await auth.api.getSession({ headers: request.headers }); if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const [settings] = await db.select().from(notificationSettings).limit(1); const configured = Array.isArray(settings?.subscriptionAlertEmails) ? settings.subscriptionAlertEmails.filter((email): email is string => typeof email === 'string' && email.includes('@')) : []; const targets = recipients.length ? recipients : configured
    if (!targets.length) return NextResponse.json({ error: 'No subscription alert recipients configured.' }, { status: 400 })
    const subject = `${payload.softwareName} subscription notification`; const message = `${payload.softwareName} expires on ${payload.expirationDate}. Renewal cost: ${payload.renewalCost ?? 'Not specified'} ${payload.currency ?? 'NGN'}. Owner: ${payload.owner ?? 'IT Operations'}.`; await sendResendEmail({ to: targets, subject, html: `<h2>Subscription renewal alert</h2><p>${message}</p>` })
    return NextResponse.json({ ok: true, sent: true, recipientCount: targets.length })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    console.error('[v0] subscription email failed', error); return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to send subscription email.' }, { status: 502 })
  }
}

export async function GET() {
  return NextResponse.json({ endpoint: '/api/notifications/subscription', method: 'POST', required: ['softwareName', 'expirationDate'], forwardsTo: process.env.N8N_DASHBOARD_ALERT_WEBHOOK_URL ?? 'https://playpen-glandular-refinery.ngrok-free.dev/webhook/dashboard-alert' })
}
