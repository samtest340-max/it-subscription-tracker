import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.V0_RUNTIME_URL),
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await fetch(process.env.N8N_DASHBOARD_ALERT_WEBHOOK_URL ?? 'https://playpen-glandular-refinery.ngrok-free.dev/webhook/dashboard-alert', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ source: 'farm-alert-it', event: 'password_reset', recipients: [user.email], subject: 'Reset your Farm Alert IT password', message: `Use this link to reset your password: ${url}`, metadata: { resetUrl: url } }),
      })
    },
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', ...['V0_RUNTIME_URL', 'V0_DEV_APP_URL', 'V0_BUILD_URL', 'V0_SANDBOX_URL'].flatMap((key) => process.env[key] ? [process.env[key] as string] : [])] : []),
    ...(process.env.NODE_ENV === 'production' ? [process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '', process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : ''].filter(Boolean) : []),
  ],
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  ...(process.env.NODE_ENV === 'development' ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } } : {}),
})
