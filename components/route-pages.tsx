import { FarmAlertApp } from './farm-alert-app'

export {
  AdminPage,
  CalendarPage,
  CamerasPage,
  LoginPage,
  SettingsPage,
  SubscriptionsPage,
  TeamPage,
} from './workspace-pages'

export function ForecastPage() {
  return <FarmAlertApp page="forecast" />
}
