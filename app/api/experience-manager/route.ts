import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { employees } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"
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

export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    const body = await request.json()
    if (!body.fullName?.trim() || !body.email?.trim()) return NextResponse.json({ error: "Name and email are required." }, { status: 400 })
    const employee = { id: crypto.randomUUID(), userId, fullName: body.fullName.trim(), email: body.email.trim().toLowerCase(), phone: body.phone?.trim() || null, department: body.department?.trim() || null, jobTitle: body.jobTitle?.trim() || null, startDate: body.startDate || null, birthday: body.birthday || null, pensionProvider: body.pensionProvider?.trim() || null, pensionNumber: body.pensionNumber?.trim() || null, taxId: body.taxId?.trim() || null }
    const [created] = await db.insert(employees).values(employee).returning()
    return NextResponse.json({ employee: created }, { status: 201 })
  } catch { return NextResponse.json({ error: "Unable to save employee." }, { status: 500 }) }
}
