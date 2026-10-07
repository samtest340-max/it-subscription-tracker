import { Metadata } from 'next'
import { PublicOnboarding } from '@/components/public-onboarding'

export const metadata: Metadata = { title: 'Employee onboarding', robots: { index: false, follow: false } }
export default async function Page({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <PublicOnboarding token={token} /> }
