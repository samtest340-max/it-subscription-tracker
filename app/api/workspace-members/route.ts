import { auth } from '@/lib/auth'
import { db, pool } from '@/lib/db'
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
  try {
    const body = await request.json()
    if (!body.id && !body.email && !body.lookupEmail) return NextResponse.json({ error: 'Member id or email is required.' }, { status: 400 })
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
  } catch (error) {
    console.error('[v0] member update failed', error)
    return NextResponse.json({ error: 'Unable to save member changes.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const body = await request.json()
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!body.id && !email) return NextResponse.json({ error: 'Member id or email is required.' }, { status: 400 })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const memberResult = await client.query('SELECT email FROM workspace_members WHERE id = $1 OR lower(email) = $2 LIMIT 1', [body.id ?? null, email])
    const targetEmail = memberResult.rows[0]?.email ?? email
    const userResult = await client.query('SELECT id FROM "user" WHERE lower(email) = lower($1) LIMIT 1', [targetEmail])
    const userId = userResult.rows[0]?.id
    if (userId) {
      await client.query('DELETE FROM camera_readings WHERE camera_id IN (SELECT id FROM cameras WHERE user_id = $1)', [userId])
      await client.query('DELETE FROM camera_incidents WHERE camera_id IN (SELECT id FROM cameras WHERE user_id = $1)', [userId])
      await client.query('DELETE FROM onboarding_identity_items WHERE page_id IN (SELECT id FROM onboarding_pages WHERE user_id = $1)', [userId])
      await client.query('DELETE FROM onboarding_documents WHERE page_id IN (SELECT id FROM onboarding_pages WHERE user_id = $1)', [userId])
      await client.query('DELETE FROM onboarding_text_blocks WHERE page_id IN (SELECT id FROM onboarding_pages WHERE user_id = $1)', [userId])
      for (const table of ['website_uptime_status', 'subscriptions', 'backup_events', 'catalog_settings', 'notification_deliveries', 'onboarding_pages', 'cameras']) await client.query(`DELETE FROM ${table} WHERE user_id = $1`, [userId])
      await client.query('DELETE FROM "session" WHERE "userId" = $1', [userId])
      await client.query('DELETE FROM account WHERE "userId" = $1', [userId])
      await client.query('DELETE FROM "user" WHERE id = $1', [userId])
    }
    await client.query('DELETE FROM workspace_members WHERE lower(email) = lower($1)', [targetEmail])
    await client.query('COMMIT')
    return NextResponse.json({ ok: true, deletedEmail: targetEmail })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[v0] account deletion failed', error)
    return NextResponse.json({ error: 'Unable to delete this account and its records.' }, { status: 500 })
  } finally { client.release() }
}
