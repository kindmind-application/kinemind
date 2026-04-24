import type { Company, User, Device } from "@/data/types";
import { api, qs } from "./client";

export interface ListParams {
  q?: string;
  status?: string;
  sector?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const companiesKeys = {
  all: ["companies"] as const,
  list: (filters: ListParams) => ["companies", "list", filters] as const,
  detail: (id: string) => ["companies", "detail", id] as const,
  employees: (id: string) => ["companies", id, "employees"] as const,
  devices: (id: string) => ["companies", id, "devices"] as const,
};

export function listCompanies(params: ListParams = {}): Promise<Paginated<Company>> {
  return api<Paginated<Company>>(`/companies${qs(params)}`);
}

export function getCompany(id: string): Promise<Company> {
  return api<Company>(`/companies/${id}`);
}

export function createCompany(data: Partial<Company>): Promise<Company> {
  return api<Company>("/companies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCompany(id: string, data: Partial<Company>): Promise<Company> {
  return api<Company>(`/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteCompany(id: string): Promise<void> {
  return api<void>(`/companies/${id}`, { method: "DELETE" });
}

export function listCompanyEmployees(id: string): Promise<Paginated<User> | User[]> {
  return api<Paginated<User> | User[]>(`/companies/${id}/employees`);
}

export function listCompanyDevices(id: string): Promise<Paginated<Device> | Device[]> {
  return api<Paginated<Device> | Device[]>(`/companies/${id}/devices`);
}
