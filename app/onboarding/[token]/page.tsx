import { Metadata } from 'next'
import { PublicOnboarding } from '@/components/public-onboarding'
import { getPublicOnboarding } from '@/lib/onboarding'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = { title: 'Employee onboarding', robots: { index: false, follow: false } }
export default async function Page({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; const data = await getPublicOnboarding(token); if (!data) notFound(); return <PublicOnboarding initialData={data} /> }
