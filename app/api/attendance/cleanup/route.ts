import { del } from '@vercel/blob'
import { lt } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'

export async function GET(request: Request) { if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const expired = await db.select({ id: attendance.id, path: attendance.photoPath }).from(attendance).where(lt(attendance.photoExpiresAt, new Date())); await Promise.all(expired.filter((item) => item.path).map((item) => del(item.path!))); if (expired.length) await db.update(attendance).set({ photoPath: null, photoExpiresAt: null }).where(lt(attendance.photoExpiresAt, new Date())); return NextResponse.json({ deleted: expired.length }) }
