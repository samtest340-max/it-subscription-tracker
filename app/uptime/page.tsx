import { FarmAlertApp } from '@/components/farm-alert-app'
import { AppShell } from '@/components/app-shell'

export default function UptimeRoute() {
  return <AppShell title="Website uptime"><FarmAlertApp page="uptime" /></AppShell>
}
