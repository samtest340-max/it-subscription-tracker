import { NextResponse } from 'next/server'

export const N8N_DASHBOARD_ALERT_WEBHOOK = process.env.N8N_DASHBOARD_ALERT_WEBHOOK_URL ?? 'https://playpen-glandular-refinery.ngrok-free.dev/webhook/dashboard-alert'

export async function forwardToN8n(payload: Record<string, unknown>) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  let response: Response
  try {
    response = await fetch(N8N_DASHBOARD_ALERT_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        source: 'farm-alert-it',
        event: 'subscription_notification',
        sentAt: new Date().toISOString(),
        ...payload,
      }),
      cache: 'no-store',
      signal: controller.signal,
    })
  } catch (error) {
    throw new Error(error instanceof Error && error.name === 'AbortError' ? 'n8n webhook timed out after 15 seconds' : `Unable to reach n8n webhook at ${N8N_DASHBOARD_ALERT_WEBHOOK}`)
  } finally {
    clearTimeout(timeout)
  }

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
  const message = error instanceof Error ? error.message : 'Unable to forward alert to n8n'
  console.error('[v0] n8n dashboard alert forwarding error:', error)
  return NextResponse.json({ error: message, webhook: N8N_DASHBOARD_ALERT_WEBHOOK }, { status: 502 })
}
