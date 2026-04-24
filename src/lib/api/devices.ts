import type { Device } from "@/data/types";
import { api, qs } from "./client";
import type { Paginated } from "./companies";

export interface DeviceListParams {
  q?: string;
  status?: string;
  companyId?: string;
  employeeId?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export const devicesKeys = {
  all: ["devices"] as const,
  list: (filters: DeviceListParams) => ["devices", "list", filters] as const,
  detail: (id: string) => ["devices", "detail", id] as const,
};

export function listDevices(params: DeviceListParams = {}): Promise<Paginated<Device>> {
  return api<Paginated<Device>>(`/devices${qs(params)}`);
}

export function getDevice(id: string): Promise<Device> {
  return api<Device>(`/devices/${id}`);
}

export function createDevice(data: Partial<Device>): Promise<Device> {
  return api<Device>("/devices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDevice(id: string, data: Partial<Device>): Promise<Device> {
  return api<Device>(`/devices/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function assignDevice(id: string, employeeId: string): Promise<Device> {
  return api<Device>(`/devices/${id}/assign`, {
    method: "POST",
    body: JSON.stringify({ employeeId }),
  });
}

export function unassignDevice(id: string): Promise<Device> {
  return api<Device>(`/devices/${id}/unassign`, { method: "POST" });
}
