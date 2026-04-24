import type { User } from "@/data/types";
import { api, qs } from "./client";
import type { Paginated } from "./companies";

export interface EmployeeListParams {
  q?: string;
  companyId?: string;
  status?: string;
  area?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export const employeesKeys = {
  all: ["employees"] as const,
  list: (filters: EmployeeListParams) => ["employees", "list", filters] as const,
  detail: (id: string) => ["employees", "detail", id] as const,
};

export function listEmployees(params: EmployeeListParams = {}): Promise<Paginated<User>> {
  return api<Paginated<User>>(`/employees${qs(params)}`);
}

export function getEmployee(id: string): Promise<User> {
  return api<User>(`/employees/${id}`);
}

export function createEmployee(data: Partial<User>): Promise<User> {
  return api<User>("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateEmployee(id: string, data: Partial<User>): Promise<User> {
  return api<User>(`/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteEmployee(id: string): Promise<void> {
  return api<void>(`/employees/${id}`, { method: "DELETE" });
}
