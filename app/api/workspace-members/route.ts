import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { workspaceMembers } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const rows = await db.select().from(workspaceMembers).orderBy(desc(workspaceMembers.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const body = await request.json()
  if (!body.name || !body.email || !body.role || typeof body.password !== 'string' || body.password.length < 8) return NextResponse.json({ error: 'Name, email, role, and a password of at least 8 characters are required.' }, { status: 400 })
  const email = String(body.email).trim().toLowerCase()
  let accountResponse
  try {
    accountResponse = await auth.api.signUpEmail({ body: { name: String(body.name).trim(), email, password: body.password }, headers: new Headers(request.headers) })
  } catch (error) {
    console.error('[v0] team account provisioning failed', error)
    return NextResponse.json({ error: 'Unable to create the login account. The email may already be registered.' }, { status: 409 })
  }
  if (!accountResponse?.user) return NextResponse.json({ error: 'Unable to create the login account.' }, { status: 400 })
  const accessPages = [...(Array.isArray(body.accessPages) ? body.accessPages : []), '__must_change_password']
  const [row] = await db.insert(workspaceMembers).values({ name: body.name, email, role: body.role, accessPages }).returning()
  return NextResponse.json(row, { status: 201 })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  if (!body.id && !body.email) return NextResponse.json({ error: 'Member id or email is required.' }, { status: 400 })
  const [existing] = await db.select({ accessPages: workspaceMembers.accessPages }).where(body.lookupEmail ? eq(workspaceMembers.email, body.lookupEmail) : body.email ? eq(workspaceMembers.email, body.email) : eq(workspaceMembers.id, body.id)).limit(1)
  const requestedPages = Array.isArray(body.accessPages) ? body.accessPages : []
  const accessPages = existing?.accessPages?.includes('__must_change_password') ? [...requestedPages, '__must_change_password'] : requestedPages
  const [row] = await db.update(workspaceMembers).set({ name: body.name, email: body.email, role: body.role, accessPages, updatedAt: new Date() }).where(body.lookupEmail ? eq(workspaceMembers.email, body.lookupEmail) : body.email ? eq(workspaceMembers.email, body.email) : eq(workspaceMembers.id, body.id)).returning()
  if (row) return NextResponse.json(row)
  if (body.name && body.email && body.role) {
    const [created] = await db.insert(workspaceMembers).values({ name: body.name, email: body.email, role: body.role, accessPages: body.accessPages ?? [] }).onConflictDoUpdate({ target: workspaceMembers.email, set: { name: body.name, role: body.role, accessPages: body.accessPages ?? [], updatedAt: new Date() } }).returning()
    return NextResponse.json(created)
  }
  return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
}

export async function DELETE(request: Request) {
  const body = await request.json()
  if (!body.id && !body.email) return NextResponse.json({ error: 'Member id or email is required.' }, { status: 400 })
  await db.delete(workspaceMembers).where(body.email ? eq(workspaceMembers.email, body.email) : eq(workspaceMembers.id, body.id))
  return NextResponse.json({ ok: true })
}
