import { api, qs } from "./client";

export interface DashboardStats {
  activeCompanies: number;
  totalEmployees: number;
  assignedDevices: number;
  availableDevices: number;
}

export interface SectorDatum {
  sector: string;
  count: number;
}

export interface GrowthDatum {
  month: string;
  employees: number;
}

export interface DeviceStatusDatum {
  status: string;
  count: number;
}

export const dashboardKeys = {
  stats: ["dashboard", "stats"] as const,
  sectors: ["dashboard", "sectors"] as const,
  growth: (months: number) => ["dashboard", "growth", months] as const,
  deviceStatus: ["dashboard", "device-status"] as const,
};

export function getStats(): Promise<DashboardStats> {
  return api<DashboardStats>("/dashboard/stats");
}

export function getSectors(): Promise<SectorDatum[]> {
  return api<SectorDatum[]>("/dashboard/sectors");
}

export function getGrowth(months = 6): Promise<GrowthDatum[]> {
  return api<GrowthDatum[]>(`/dashboard/growth${qs({ months })}`);
}

export function getDeviceStatus(): Promise<DeviceStatusDatum[]> {
  return api<DeviceStatusDatum[]>("/dashboard/device-status");
}
