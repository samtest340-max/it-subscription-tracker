import { db } from '@/lib/db'
import { auditEvents } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const rows = await db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt)).limit(20)
  return NextResponse.json(rows)
}
