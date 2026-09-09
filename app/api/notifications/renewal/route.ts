import { NextResponse } from 'next/server'
import { forwardToN8n, webhookError } from '@/lib/n8n'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const required = ['to', 'softwareName', 'expirationDate', 'renewalCost', 'dashboardUrl']
    if (!required.every((key) => typeof payload[key] === 'string' && payload[key].trim())) {
      return NextResponse.json({ error: 'Invalid renewal email payload' }, { status: 400 })
    }

    const result = await forwardToN8n({
      type: 'renewal_reminder',
      recipients: [payload.to],
      subject: `Subscription renewal reminder: ${payload.softwareName}`,
      message: `The ${payload.softwareName} subscription expires on ${payload.expirationDate}. Renewal cost: ${payload.renewalCost}.`,
      metadata: {
        softwareName: payload.softwareName,
        expirationDate: payload.expirationDate,
        renewalCost: payload.renewalCost,
        dashboardUrl: payload.dashboardUrl,
      },
    })
    return NextResponse.json({ ok: true, forwarded: true, n8nResponse: result.result })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    return webhookError(error)
  }
}
