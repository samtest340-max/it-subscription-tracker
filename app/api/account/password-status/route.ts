import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { workspaceMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [member] = await db.select({ accessPages: workspaceMembers.accessPages }).from(workspaceMembers).where(eq(workspaceMembers.email, session.user.email)).limit(1)
  return NextResponse.json({ mustChangePassword: Array.isArray(member?.accessPages) && member.accessPages.includes('__must_change_password') })
}

export async function PATCH() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [member] = await db.select({ accessPages: workspaceMembers.accessPages }).from(workspaceMembers).where(eq(workspaceMembers.email, session.user.email)).limit(1)
  const accessPages = Array.isArray(member?.accessPages) ? member.accessPages.filter((page) => page !== '__must_change_password') : []
  await db.update(workspaceMembers).set({ accessPages, updatedAt: new Date() }).where(eq(workspaceMembers.email, session.user.email))
  return NextResponse.json({ ok: true })
}
