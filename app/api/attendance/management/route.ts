import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { attendanceExceptions, attendanceHolidays } from '@/lib/db/schema'

async function authorized(request: Request) { return Boolean((await auth.api.getSession({ headers: request.headers }))?.user) }
export async function POST(request: Request) { if (!await authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const body = await request.json(); if (body.type === 'holiday') { const [row] = await db.insert(attendanceHolidays).values({ holidayDate: body.date, name: body.name }).returning(); return NextResponse.json(row, { status: 201 }) } const [row] = await db.insert(attendanceExceptions).values({ employeeId: body.employeeId, exceptionType: body.exceptionType === 'On leave' ? 'leave' : 'excused', startsOn: body.startsOn, endsOn: body.endsOn, note: body.note || null }).returning(); return NextResponse.json(row, { status: 201 }) }
export async function DELETE(request: Request) { if (!await authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const body = await request.json(); if (body.type === 'holiday') await db.delete(attendanceHolidays).where(eq(attendanceHolidays.id, body.id)); else await db.delete(attendanceExceptions).where(eq(attendanceExceptions.id, body.id)); return NextResponse.json({ ok: true }) }
