import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { onboardingDocuments, onboardingIdentityItems, onboardingPages, onboardingTextBlocks } from '@/lib/db/schema'

export async function getPublicOnboarding(token: string) {
  const [page] = await db.select().from(onboardingPages).where(eq(onboardingPages.token, token))
  if (!page) return null
  if (!page.isLive) return { offline: true as const }
  const [identity, documents, blocks] = await Promise.all([
    db.select().from(onboardingIdentityItems).where(eq(onboardingIdentityItems.pageId, page.id)).orderBy(asc(onboardingIdentityItems.sortOrder)),
    db.select().from(onboardingDocuments).where(eq(onboardingDocuments.pageId, page.id)).orderBy(asc(onboardingDocuments.sortOrder)),
    db.select().from(onboardingTextBlocks).where(eq(onboardingTextBlocks.pageId, page.id)).orderBy(asc(onboardingTextBlocks.sortOrder)),
  ])
  return { page, identity, documents: documents.filter((document) => Boolean(document.fileUrl)), blocks }
}
