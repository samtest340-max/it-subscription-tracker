import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { employees } from "@/lib/db/schema"
import { and, asc, eq } from "drizzle-orm"
import { headers } from "next/headers"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function GET() {
  try {
    const userId = await getUserId()
    const records = await db.select().from(employees).where(eq(employees.userId, userId)).orderBy(asc(employees.fullName))
    return NextResponse.json({ employees: records })
  } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId()
    const body = await request.json()
    if (!body.id || !body.fullName?.trim() || !body.email?.trim()) return NextResponse.json({ error: "ID, name and email are required." }, { status: 400 })
    const [updated] = await db.update(employees).set({ fullName: body.fullName.trim(), email: body.email.trim().toLowerCase(), phone: body.phone?.trim() || null, department: body.department?.trim() || null, jobTitle: body.jobTitle?.trim() || null, startDate: body.startDate || null, birthday: body.birthday ? String(body.birthday).slice(0, 10) : null, pensionProvider: body.pensionProvider?.trim() || null, pensionNumber: body.pensionNumber?.trim() || null, taxId: body.taxId?.trim() || null }).where(and(eq(employees.id, body.id), eq(employees.userId, userId))).returning()
    if (!updated) return NextResponse.json({ error: "Employee not found." }, { status: 404 })
    return NextResponse.json({ employee: updated })
  } catch { return NextResponse.json({ error: "Unable to update employee." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId()
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "Employee ID is required." }, { status: 400 })
    const [deleted] = await db.delete(employees).where(and(eq(employees.id, id), eq(employees.userId, userId))).returning({ id: employees.id })
    if (!deleted) return NextResponse.json({ error: "Employee not found." }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: "Unable to delete employee." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    const body = await request.json()
    if (!body.fullName?.trim() || !body.email?.trim()) return NextResponse.json({ error: "Name and email are required." }, { status: 400 })
    const employee = { id: crypto.randomUUID(), userId, fullName: body.fullName.trim(), email: body.email.trim().toLowerCase(), phone: body.phone?.trim() || null, department: body.department?.trim() || null, jobTitle: body.jobTitle?.trim() || null, startDate: body.startDate || null, birthday: body.birthday ? String(body.birthday).slice(0, 10) : null, pensionProvider: body.pensionProvider?.trim() || null, pensionNumber: body.pensionNumber?.trim() || null, taxId: body.taxId?.trim() || null }
    const [created] = await db.insert(employees).values(employee).returning()
    return NextResponse.json({ employee: created }, { status: 201 })
  } catch { return NextResponse.json({ error: "Unable to save employee." }, { status: 500 }) }
}
