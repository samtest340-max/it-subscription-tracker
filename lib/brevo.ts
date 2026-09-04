import 'server-only'

export type RenewalEmail = {
  to: string
  recipientName?: string
  softwareName: string
  expirationDate: string
  renewalCost: string
  dashboardUrl: string
}

export async function sendRenewalEmail(email: RenewalEmail) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL

  if (!apiKey || !senderEmail) {
    throw new Error('Brevo email configuration is missing')
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: 'farm alert IT' },
      to: [{ email: email.to, name: email.recipientName }],
      subject: `Renewal reminder: ${email.softwareName}`,
      htmlContent: `<html><body><h2>Subscription renewal reminder</h2><p><strong>${email.softwareName}</strong> expires on <strong>${email.expirationDate}</strong>.</p><p>Renewal cost: <strong>${email.renewalCost}</strong></p><p><a href="${email.dashboardUrl}">Open farm alert IT</a></p></body></html>`,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const details = await response.text()
    console.error('[v0] Brevo email failed:', response.status, details)
    throw new Error('Brevo email delivery failed')
  }

  return response.json() as Promise<{ messageId?: string }>
}
