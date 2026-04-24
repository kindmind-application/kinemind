import { ComingSoon } from "@/components/shared/coming-soon";

// Users and Devices are now implemented in their own modules.

export function ProductionPage() {
  return <ComingSoon title="Producción" description="Control y seguimiento de la producción de dispositivos PostureBand." />;
}

export function InventoryPage() {
  return <ComingSoon title="Inventario" description="Gestión de inventario de dispositivos y componentes." />;
}

export function LogisticsPage() {
  return <ComingSoon title="Logística" description="Seguimiento de envíos y distribución de dispositivos." />;
}

export function SalesPage() {
  return <ComingSoon title="Ventas" description="Gestión de ventas, cotizaciones y contratos." />;
}

export function SettingsPage() {
  return <ComingSoon title="Configuración" description="Configuración general del sistema y preferencias de usuario." />;
}
