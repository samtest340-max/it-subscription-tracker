import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { workspaceMembers } from "@/lib/db/schema"
import { asc } from "drizzle-orm"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const members = await db.select({ id: workspaceMembers.id, name: workspaceMembers.name, email: workspaceMembers.email, role: workspaceMembers.role, accessPages: workspaceMembers.accessPages, createdAt: workspaceMembers.createdAt }).from(workspaceMembers).orderBy(asc(workspaceMembers.name))
  return NextResponse.json({ members })
}
