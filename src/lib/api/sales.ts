import { api, qs } from "./client";
import type { Paginated } from "./companies";

export interface Customer {
  id: string;
  name: string;
  nit: string;
}

export interface QuoteItem {
  lineNo: number;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export interface Quote {
  id: string;
  companyId: string;
  status: QuoteStatus;
  validUntil: string | null;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  customerFull?: unknown;
  items?: QuoteItem[];
}

export type ContractStatus = "draft" | "active" | "expired" | "terminated";

export interface Contract {
  id: string;
  companyId: string;
  quoteId: string | null;
  status: ContractStatus;
  startDate: string | null;
  endDate: string | null;
  totalValue: number;
  paymentTerms: string | null;
  signedAt: string | null;
  signedByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
}

export type OrderStatus =
  | "pending"
  | "in_production"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  contractId: string | null;
  companyId: string;
  status: OrderStatus;
  requestedDevices: number;
  requestedDeliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
}

export interface SalesListParams {
  q?: string;
  status?: string;
  companyId?: string;
  page?: number;
  pageSize?: number;
}

export const quotesKeys = {
  all: ["quotes"] as const,
  list: (filters: SalesListParams) => ["quotes", "list", filters] as const,
  detail: (id: string) => ["quotes", "detail", id] as const,
};

export const contractsKeys = {
  all: ["contracts"] as const,
  list: (filters: SalesListParams) => ["contracts", "list", filters] as const,
  detail: (id: string) => ["contracts", "detail", id] as const,
};

export const ordersKeys = {
  all: ["orders"] as const,
  list: (filters: SalesListParams) => ["orders", "list", filters] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
};

// ---------- Quotes ----------
export function listQuotes(params: SalesListParams = {}): Promise<Paginated<Quote>> {
  return api<Paginated<Quote>>(`/quotes${qs(params)}`);
}

export function getQuote(id: string): Promise<Quote> {
  return api<Quote>(`/quotes/${id}`);
}

export interface CreateQuoteInput {
  companyId: string;
  status?: QuoteStatus;
  validUntil?: string;
  currency?: string;
  items: Omit<QuoteItem, "lineNo" | "lineTotal">[];
  notes?: string;
  createdBy?: string;
}

export function createQuote(data: CreateQuoteInput): Promise<Quote> {
  return api<Quote>("/quotes", { method: "POST", body: JSON.stringify(data) });
}

export function updateQuote(id: string, data: Partial<Quote>): Promise<Quote> {
  return api<Quote>(`/quotes/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteQuote(id: string): Promise<void> {
  return api<void>(`/quotes/${id}`, { method: "DELETE" });
}

// ---------- Contracts ----------
export function listContracts(params: SalesListParams = {}): Promise<Paginated<Contract>> {
  return api<Paginated<Contract>>(`/contracts${qs(params)}`);
}

export function getContract(id: string): Promise<Contract> {
  return api<Contract>(`/contracts/${id}`);
}

export interface CreateContractInput {
  companyId: string;
  status?: ContractStatus;
  startDate?: string;
  endDate?: string;
  totalValue: number;
  paymentTerms?: string;
  signedAt?: string;
  signedByAdminId?: string;
  quoteId?: string;
}

export function createContract(data: CreateContractInput): Promise<Contract> {
  return api<Contract>("/contracts", { method: "POST", body: JSON.stringify(data) });
}

export function updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
  return api<Contract>(`/contracts/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteContract(id: string): Promise<void> {
  return api<void>(`/contracts/${id}`, { method: "DELETE" });
}

export function terminateContract(id: string): Promise<Contract> {
  return updateContract(id, { status: "terminated" });
}

// ---------- Orders ----------
export function listOrders(params: SalesListParams = {}): Promise<Paginated<Order>> {
  return api<Paginated<Order>>(`/orders${qs(params)}`);
}

export function getOrder(id: string): Promise<Order> {
  return api<Order>(`/orders/${id}`);
}

export interface CreateOrderInput {
  contractId?: string;
  companyId: string;
  status?: OrderStatus;
  requestedDevices: number;
  requestedDeliveryDate?: string;
}

export function createOrder(data: CreateOrderInput): Promise<Order> {
  return api<Order>("/orders", { method: "POST", body: JSON.stringify(data) });
}

export function updateOrder(id: string, data: Partial<Order>): Promise<Order> {
  return api<Order>(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function cancelOrder(id: string): Promise<Order> {
  return updateOrder(id, { status: "cancelled" });
}

// ---------- Status maps ----------
export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "Borrador",
  sent: "Enviada",
  accepted: "Aceptada",
  rejected: "Rechazada",
  expired: "Expirada",
};

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  draft: "Borrador",
  active: "Activo",
  expired: "Expirado",
  terminated: "Terminado",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente",
  in_production: "En producción",
  ready_to_ship: "Lista para envío",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function quoteStatusVariant(s: QuoteStatus): BadgeVariant {
  switch (s) {
    case "accepted": return "default";
    case "sent": return "secondary";
    case "rejected":
    case "expired": return "destructive";
    default: return "outline";
  }
}

export function contractStatusVariant(s: ContractStatus): BadgeVariant {
  switch (s) {
    case "active": return "default";
    case "terminated":
    case "expired": return "destructive";
    default: return "outline";
  }
}

export function orderStatusVariant(s: OrderStatus): BadgeVariant {
  switch (s) {
    case "delivered": return "default";
    case "in_production":
    case "ready_to_ship":
    case "shipped": return "secondary";
    case "cancelled": return "destructive";
    default: return "outline";
  }
}

// COP currency formatter
const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "$0";
  return COP.format(value);
}
