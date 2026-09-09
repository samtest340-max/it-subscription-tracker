import { NextResponse } from 'next/server'

export const N8N_DASHBOARD_ALERT_WEBHOOK = 'http://localhost:5678/webhook/dashboard-alert'

export async function forwardToN8n(payload: Record<string, unknown>) {
  const response = await fetch(N8N_DASHBOARD_ALERT_WEBHOOK, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      source: 'farm-alert-it',
      sentAt: new Date().toISOString(),
      ...payload,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const details = await response.text()
    console.error('[v0] n8n dashboard alert webhook failed:', response.status, details)
    throw new Error('n8n dashboard alert webhook failed')
  }

  const responseText = await response.text()
  let result: unknown = null
  if (responseText) {
    try { result = JSON.parse(responseText) } catch { result = responseText }
  }
  return { status: response.status, result }
}

export function webhookError(error: unknown) {
  console.error('[v0] n8n dashboard alert forwarding error:', error)
  return NextResponse.json({ error: 'Unable to forward alert to n8n' }, { status: 502 })
}
