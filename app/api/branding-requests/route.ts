import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { brandingRequests } from '@/lib/db/schema'

const statuses = ['Submitted', 'In Review', 'In Progress', 'Awaiting Feedback', 'Approved', 'Delivered', 'Rejected']
const priorities = ['Low', 'Medium', 'High', 'Urgent']

function clean(value: unknown) { return typeof value === 'string' ? value.trim() : '' }

export async function GET() {
  const rows = await db.select().from(brandingRequests).orderBy(desc(brandingRequests.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const body = await request.json()
  const title = clean(body.title)
  const requesterName = clean(body.requesterName)
  const requesterEmail = clean(body.requesterEmail)
  const department = clean(body.department)
  const requestType = clean(body.requestType)
  const priority = clean(body.priority)
  const deadline = clean(body.deadline)
  const description = clean(body.description)
  const audience = clean(body.audience)
  const approval = clean(body.approval)
  if (!title || !requesterName || !requesterEmail || !department || !requestType || !priority || !deadline || !description || !audience || !approval || !priorities.includes(priority)) return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 })
  const requestCode = `BR-${Date.now().toString().slice(-6)}`
  const [created] = await db.insert(brandingRequests).values({ requestCode, title, requesterName, requesterEmail, department, requestType, priority, deadline, description, audience, approval, files: [] }).returning()
  return NextResponse.json(created, { status: 201 })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const id = clean(body.id)
  const status = clean(body.status)
  if (!id || !statuses.includes(status)) return NextResponse.json({ error: 'Invalid request update.' }, { status: 400 })
  const [updated] = await db.update(brandingRequests).set({ status, updatedAt: new Date() }).where(id.startsWith('BR-') ? eq(brandingRequests.requestCode, id) : eq(brandingRequests.id, id)).returning()
  if (!updated) return NextResponse.json({ error: 'Request not found.' }, { status: 404 })
  return NextResponse.json(updated)
}
