import { FarmAlertApp } from './farm-alert-app'
export function LoginPage() { return null }
export function SubscriptionsPage() { return <FarmAlertApp page="subscriptions" /> }
export function CalendarPage() { return <FarmAlertApp page="calendar" /> }
export function ForecastPage() { return <FarmAlertApp page="forecast" /> }
export function CamerasPage() { return <FarmAlertApp page="cameras" /> }
export function TeamPage() { return <FarmAlertApp page="admin" /> }
export function AdminPage() { return <AdminConsole /> }
export function SettingsPage() { return <SettingsConsole /> }
function AdminConsole() { return <FarmAlertApp page="admin" /> }
function SettingsConsole() { return <FarmAlertApp page="settings" /> }
