const configuredSender = process.env.RESEND_FROM_EMAIL || process.env.RESEND_SENDER_EMAIL || process.env.RESEND_EMAIL_DOMAIN || 'onboarding@resend.dev'
export const resendFrom = configuredSender.includes('@') ? configuredSender : configuredSender === 'resend.dev' ? 'onboarding@resend.dev' : `noreply@${configuredSender}`

export async function sendResendEmail(input: { to: string[]; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY || process.env.RESEND_EMAIL_RESEND_API_KEY
  if (!apiKey) throw new Error('Resend is not configured.')
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: resendFrom, to: input.to, subject: input.subject, html: input.html }), cache: 'no-store' })
  const body = await response.text()
  if (!response.ok) throw new Error(`Resend rejected the email: ${body}`)
  return body
}
