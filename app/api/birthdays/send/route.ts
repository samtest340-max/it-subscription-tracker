import { NextResponse } from 'next/server'
import { and, eq, isNull, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { employees, notificationSettings } from '@/lib/db/schema'
import { sendResendEmail } from '@/lib/resend'

const configuredSender = process.env.RESEND_FROM_EMAIL || process.env.RESEND_SENDER_EMAIL || process.env.RESEND_EMAIL_DOMAIN || 'info@farmalert.com.ng'
const fromEmail = configuredSender.includes('@') ? configuredSender : configuredSender === 'resend.dev' ? 'onboarding@resend.dev' : `noreply@${configuredSender}`
const resendApiKey = process.env.RESEND_API_KEY || process.env.RESEND_EMAIL_RESEND_API_KEY

function birthdayMatchesToday(value: string | null, now: Date) {
  if (!value) return false
  const [year, month, day] = value.split('-').map(Number)
  const isLeapYear = now.getFullYear() % 4 === 0 && (now.getFullYear() % 100 !== 0 || now.getFullYear() % 400 === 0)
  const targetDay = month === 2 && day === 29 && !isLeapYear ? 28 : day
  return month === now.getMonth() + 1 && targetDay === now.getDate()
}

function firstName(fullName: string) { return fullName.trim().split(/\s+/)[0] || fullName }

function birthdayHtml(name: string) {
  return `<div style="background:#f4fbf8;padding:32px;font-family:Arial,sans-serif;color:#183b3b"><div style="max-width:600px;margin:auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #dce9e5"><div style="font-weight:800;color:#176b71;font-size:18px;margin-bottom:24px">Farm Alert</div><h1 style="font-size:26px;margin:0 0 20px">Happy Birthday, ${name}! 🎂</h1><p>Dear ${name},</p><p>Today is all about you, and we couldn&apos;t let it pass without saying how grateful we are to have you on our team. 🎉</p><p>Your hard work, kindness, and energy make a real difference here, and we truly appreciate everything you bring every single day.</p><p>We hope your birthday is filled with joy, laughter, good food, and people who love you. May the year ahead bring you good health, success, and every good thing you&apos;re hoping for.</p><p>Enjoy your special day. You&apos;ve earned it! 🎈</p><p>With love and warm wishes,<br/>The Farm Alert Family</p></div></div>`
}

async function sendEmail(to: string, name: string) {
  if (!resendApiKey) throw new Error('Resend is not configured.')
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: fromEmail, to: [to], subject: `Happy Birthday, ${name}! 🎂`, html: birthdayHtml(name) }) })
  if (!response.ok) throw new Error(await response.text())
}

export async function GET(request: Request) {
  if (process.env.CRON_SECRET && request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return sendTodaysBirthdays()
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    if (body.employeeId) {
      const [employee] = await db.select().from(employees).where(eq(employees.id, body.employeeId)).limit(1)
      if (!employee?.email || employee.email.endsWith('@unprovided.invalid')) return NextResponse.json({ error: 'Employee needs a valid email address.' }, { status: 400 })
      await sendEmail(employee.email, firstName(employee.fullName))
      await db.update(employees).set({ lastBirthdayEmailSentYear: new Date().getFullYear() }).where(eq(employees.id, employee.id))
      return NextResponse.json({ ok: true })
    }
    return sendTodaysBirthdays()
  } catch (error) { console.error('[v0] birthday email failed', error); return NextResponse.json({ error: 'Unable to send birthday email.' }, { status: 500 }) }
}

async function sendTodaysBirthdays() {
  const now = new Date(); const reminderDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); const [settings] = await db.select().from(notificationSettings).limit(1); const managerEmail = settings?.birthdayManagerEmail; if (!managerEmail) return NextResponse.json({ sent: 0, failed: 0, skipped: 'No birthday manager email configured.' }); const records = await db.select().from(employees); const upcoming = records.filter((employee) => birthdayMatchesToday(employee.birthday, reminderDate)); const results = await Promise.allSettled(upcoming.map((employee) => sendResendEmail({ to: [managerEmail], subject: `Birthday reminder: ${employee.fullName} is turning up in 2 days`, html: `<h2>Upcoming birthday reminder</h2><p><strong>${employee.fullName}</strong>&apos;s birthday is in 2 days.</p><p>Birthday: ${employee.birthday}</p>` }))); const failed = results.filter((result) => result.status === 'rejected').length; return NextResponse.json({ sent: results.length - failed, failed, recipient: managerEmail })
}
