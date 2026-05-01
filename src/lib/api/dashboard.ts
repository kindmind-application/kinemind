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

export interface SalesPipelineDatum {
  status: string;
  count: number;
}

export interface SalesFunnelDatum {
  stage: string;
  count: number;
}

export interface RevenueDatum {
  month: string;
  revenue: number;
}

export interface BatchYieldDatum {
  batchCode: string;
  yieldPct: number;
  quantityTarget: number;
  quantityPassedQa: number;
}

export interface InventoryAlert {
  sku: string;
  name: string;
  onHand: number;
  reorderPoint: number;
  category: string;
}

export interface ShipmentOTD {
  onTimePct: number;
  total: number;
  onTime: number;
}

export const dashboardKeys = {
  stats: ["dashboard", "stats"] as const,
  sectors: ["dashboard", "sectors"] as const,
  growth: (months: number) => ["dashboard", "growth", months] as const,
  deviceStatus: ["dashboard", "device-status"] as const,
  salesPipeline: ["dashboard", "sales-pipeline"] as const,
  salesFunnel: ["dashboard", "sales-funnel"] as const,
  revenue: (months: number) => ["dashboard", "revenue", months] as const,
  batchYield: (limit: number) => ["dashboard", "batch-yield", limit] as const,
  inventoryAlerts: (onlyLow: boolean) => ["dashboard", "inventory-alerts", onlyLow] as const,
  shipmentOTD: ["dashboard", "shipment-otd"] as const,
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

export function getSalesPipeline(): Promise<SalesPipelineDatum[]> {
  return api<SalesPipelineDatum[]>("/dashboard/sales-pipeline");
}

export function getSalesFunnel(): Promise<SalesFunnelDatum[]> {
  return api<SalesFunnelDatum[]>("/dashboard/sales-funnel");
}

export function getRevenue(months = 6): Promise<RevenueDatum[]> {
  return api<RevenueDatum[]>(`/dashboard/revenue${qs({ months })}`);
}

export function getBatchYield(limit = 10): Promise<BatchYieldDatum[]> {
  return api<BatchYieldDatum[]>(`/dashboard/batch-yield${qs({ limit })}`);
}

export function getInventoryAlerts(onlyLow = true): Promise<InventoryAlert[]> {
  return api<InventoryAlert[]>(`/dashboard/inventory-alerts${qs({ only_low: onlyLow })}`);
}

export function getShipmentOTD(): Promise<ShipmentOTD> {
  return api<ShipmentOTD>("/dashboard/shipment-otd");
}
