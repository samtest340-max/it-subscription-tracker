import { NextResponse } from 'next/server'
import { sendRenewalEmail } from '@/lib/brevo'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const required = ['to', 'softwareName', 'expirationDate', 'renewalCost', 'dashboardUrl']
    if (!required.every((key) => typeof payload[key] === 'string' && payload[key].trim())) {
      return NextResponse.json({ error: 'Invalid renewal email payload' }, { status: 400 })
    }

    const result = await sendRenewalEmail(payload)
    return NextResponse.json({ ok: true, messageId: result.messageId ?? null })
  } catch (error) {
    console.error('[v0] Renewal notification error:', error)
    return NextResponse.json({ error: 'Unable to send renewal notification' }, { status: 500 })
  }
}
