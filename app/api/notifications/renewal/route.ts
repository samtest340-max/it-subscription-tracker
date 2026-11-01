import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notificationSettings } from '@/lib/db/schema'
import { sendResendEmail } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const required = ['to', 'softwareName', 'expirationDate', 'renewalCost', 'dashboardUrl']
    if (!required.every((key) => typeof payload[key] === 'string' && payload[key].trim())) {
      return NextResponse.json({ error: 'Invalid renewal email payload' }, { status: 400 })
    }

    const session = await auth.api.getSession({ headers: request.headers }); if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const [settings] = await db.select().from(notificationSettings).limit(1); const fallback = Array.isArray(settings?.subscriptionAlertEmails) ? settings.subscriptionAlertEmails.filter((email): email is string => typeof email === 'string' && email.includes('@')) : []; const target = payload.to || fallback[0]; if (!target) return NextResponse.json({ error: 'No subscription alert recipient configured.' }, { status: 400 }); await sendResendEmail({ to: [target], subject: `Subscription renewal reminder: ${payload.softwareName}`, html: `<h2>Subscription renewal reminder</h2><p>The <strong>${payload.softwareName}</strong> subscription expires on <strong>${payload.expirationDate}</strong>.</p><p>Renewal cost: ${payload.renewalCost}.</p>` }); return NextResponse.json({ ok: true, sent: true, email: target })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    console.error('[v0] renewal email failed', error); return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to send renewal email.' }, { status: 502 })
  }
}
