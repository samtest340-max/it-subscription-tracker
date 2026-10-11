import { FarmAlertApp } from '@/components/farm-alert-app'
import { AppShell } from '@/components/app-shell'

export default function BackupsPage() {
  return <AppShell title="Backup & recovery"><FarmAlertApp page="backups" /></AppShell>
}
