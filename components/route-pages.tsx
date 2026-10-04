import { FarmAlertApp } from './farm-alert-app'
import { BrandingRequestsPage } from './branding-requests-page'

export {
  AdminPage,
  CalendarPage,
  CamerasPage,
  LoginPage,
  SettingsPage,
  SubscriptionsPage,
  TeamPage,
} from './workspace-pages'

export { BrandingRequestsPage }

export function ForecastPage() {
  return <FarmAlertApp page="forecast" />
}
