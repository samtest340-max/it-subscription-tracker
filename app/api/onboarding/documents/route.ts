import { del } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { onboardingDocuments, onboardingPages } from '@/lib/db/schema'

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const [document] = await db.select({ document: onboardingDocuments, page: onboardingPages }).from(onboardingDocuments).innerJoin(onboardingPages, eq(onboardingDocuments.pageId, onboardingPages.id)).where(and(eq(onboardingDocuments.id, id), eq(onboardingPages.userId, session.user.id)))
  if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  if (document.document.fileUrl) await del(document.document.fileUrl)
  await db.delete(onboardingDocuments).where(eq(onboardingDocuments.id, id))
  return NextResponse.json({ ok: true })
}
