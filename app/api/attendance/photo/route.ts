import { get } from '@vercel/blob'
import { eq, gt } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'

export async function GET(request: Request) { const session = await auth.api.getSession({ headers: request.headers }); if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const pathname = new URL(request.url).searchParams.get('pathname'); if (!pathname) return NextResponse.json({ error: 'Missing photo' }, { status: 400 }); const [record] = await db.select({ path: attendance.photoPath, expires: attendance.photoExpiresAt }).from(attendance).where(eq(attendance.photoPath, pathname)).limit(1); if (!record?.path || !record.expires || record.expires <= new Date()) return new NextResponse('Photo expired', { status: 410 }); const result = await get(pathname, { access: 'private' }); if (!result) return new NextResponse('Not found', { status: 404 }); return new NextResponse(result.stream, { headers: { 'Content-Type': result.blob.contentType, 'Cache-Control': 'private, no-store' } }) }
