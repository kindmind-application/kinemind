import { api } from "./client";

export interface ClientAdmin {
  id: string;
  username: string;
  displayName: string;
  companyId: string;
  companyName: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface CreateClientPayload {
  companyId: string;
  username: string;
  displayName?: string;
  password: string;
}

export const clientsKeys = {
  all: ["clients"] as const,
  list: () => ["clients", "list"] as const,
};

export async function listClients(): Promise<ClientAdmin[]> {
  const res = await api<{ clients: ClientAdmin[] }>("/clients");
  return res.clients ?? [];
}

export async function createClient(payload: CreateClientPayload): Promise<ClientAdmin> {
  const res = await api<{ client: ClientAdmin }>("/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.client;
}

export async function deactivateClient(id: string): Promise<void> {
  await api<void>(`/clients/${id}`, { method: "DELETE" });
}
