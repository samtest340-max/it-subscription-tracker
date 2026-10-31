import { and, eq, gte, lte } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { attendance, employees } from '@/lib/db/schema'

export async function GET(request: Request) { const session = await auth.api.getSession({ headers: request.headers }); if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const url = new URL(request.url); const month = url.searchParams.get('month') || new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit' }).format(new Date()).slice(0, 7); const rows = await db.select({ id: attendance.id, employeeId: attendance.employeeId, attendanceDate: attendance.attendanceDate, signInTime: attendance.signInTime, status: attendance.status, photoPath: attendance.photoPath, photoExpiresAt: attendance.photoExpiresAt, fullName: employees.fullName }).from(attendance).leftJoin(employees, eq(attendance.employeeId, employees.id)).where(and(gte(attendance.attendanceDate, `${month}-01`), lte(attendance.attendanceDate, `${month}-31`))); return NextResponse.json({ month, attendance: rows.filter((row) => !row.photoExpiresAt || row.photoExpiresAt > new Date()).map((row) => ({ ...row, photoPath: row.photoExpiresAt && row.photoExpiresAt > new Date() ? row.photoPath : null })) }) }
