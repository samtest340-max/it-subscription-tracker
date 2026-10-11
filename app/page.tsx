import { FarmAlertApp } from '@/components/farm-alert-app'
import { AppShell } from '@/components/app-shell'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')
  return <AppShell><FarmAlertApp /></AppShell>
}
