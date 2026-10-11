import { FarmAlertApp } from './farm-alert-app'
import { AppShell } from './app-shell'
import { BrandingRequestsPage } from './branding-requests-page'
export { OnboardingManager } from './onboarding-manager'
export { CatalogManager } from './catalog-manager'

export {
  AdminPage,
  CalendarPage,
  LoginPage,
  SettingsPage,
} from './workspace-pages'

export { BrandingRequestsPage }

export function SubscriptionsPage() {
  return <AppShell title="Subscriptions"><FarmAlertApp page="subscriptions" /></AppShell>
}

export function CamerasPage() {
  return <AppShell title="Camera status"><FarmAlertApp page="cameras" /></AppShell>
}

export function ForecastPage() {
  return <AppShell title="Forecast"><FarmAlertApp page="forecast" /></AppShell>
}
