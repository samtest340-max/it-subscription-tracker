import { FarmAlertApp } from './farm-alert-app'
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
  return <FarmAlertApp page="subscriptions" />
}

export function CamerasPage() {
  return <FarmAlertApp page="cameras" />
}

export function ForecastPage() {
  return <FarmAlertApp page="forecast" />
}
