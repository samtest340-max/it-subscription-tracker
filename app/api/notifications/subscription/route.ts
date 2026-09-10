import { NextResponse } from 'next/server'
import { forwardToN8n, webhookError } from '@/lib/n8n'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const recipients = Array.isArray(payload.recipients)
      ? payload.recipients.filter((recipient: unknown) => typeof recipient === 'string' && recipient.includes('@'))
      : []

    if (!payload.softwareName || !payload.expirationDate || recipients.length === 0) {
      return NextResponse.json({ error: 'softwareName, expirationDate, and at least one valid recipient are required' }, { status: 400 })
    }

    const forwarded = await forwardToN8n({
      type: 'renewal_reminder',
      recipients,
      subject: `${payload.softwareName} subscription notification`,
      message: `${payload.softwareName} expires on ${payload.expirationDate}. Renewal cost: ${payload.renewalCost ?? 'Not specified'} ${payload.currency ?? 'NGN'}. Owner: ${payload.owner ?? 'IT Operations'}.`,
      metadata: {
        softwareName: payload.softwareName,
        category: payload.category ?? null,
        owner: payload.owner ?? null,
        expirationDate: payload.expirationDate,
        renewalCost: payload.renewalCost ?? null,
        currency: payload.currency ?? 'NGN',
      },
    })

    return NextResponse.json({ ok: true, forwarded: true, recipientCount: recipients.length, webhook: process.env.N8N_DASHBOARD_ALERT_WEBHOOK_URL ?? 'http://localhost:5678/webhook/dashboard-alert', n8nStatus: forwarded.status, n8nResponse: forwarded.result })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    return webhookError(error)
  }
}

export async function GET() {
  return NextResponse.json({ endpoint: '/api/notifications/subscription', method: 'POST', required: ['softwareName', 'expirationDate', 'recipients'], forwardsTo: 'http://localhost:5678/webhook/dashboard-alert' })
}
