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
  if (!body.name || !body.email || !body.role) return NextResponse.json({ error: 'Name, email, and role are required.' }, { status: 400 })
  const [row] = await db.insert(workspaceMembers).values({ name: body.name, email: body.email, role: body.role, accessPages: body.accessPages ?? [] }).returning()
  return NextResponse.json(row, { status: 201 })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  if (!body.id && !body.email) return NextResponse.json({ error: 'Member id or email is required.' }, { status: 400 })
  const [row] = await db.update(workspaceMembers).set({ name: body.name, email: body.email, role: body.role, accessPages: body.accessPages ?? [], updatedAt: new Date() }).where(body.lookupEmail ? eq(workspaceMembers.email, body.lookupEmail) : body.email ? eq(workspaceMembers.email, body.email) : eq(workspaceMembers.id, body.id)).returning()
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
