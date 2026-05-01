import { api, qs } from "./client";
import type { Paginated } from "./companies";
import type { Customer, BadgeVariant } from "./sales";

// ---------- Batches ----------
export type BatchStatus = "planned" | "in_progress" | "qa" | "completed" | "cancelled";

export interface Batch {
  id: string;
  batchCode: string;
  orderId: string | null;
  status: BatchStatus;
  quantityTarget: number;
  quantityProduced: number;
  quantityPassedQa: number;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BatchListParams {
  q?: string;
  status?: string;
  orderId?: string;
  page?: number;
  pageSize?: number;
}

export const batchesKeys = {
  all: ["batches"] as const,
  list: (filters: BatchListParams) => ["batches", "list", filters] as const,
  detail: (id: string) => ["batches", "detail", id] as const,
};

export function listBatches(params: BatchListParams = {}): Promise<Paginated<Batch>> {
  return api<Paginated<Batch>>(`/batches${qs(params)}`);
}

export function getBatch(id: string): Promise<Batch> {
  return api<Batch>(`/batches/${id}`);
}

export interface CreateBatchInput {
  batchCode: string;
  orderId?: string;
  quantityTarget: number;
  notes?: string;
}

export function createBatch(data: CreateBatchInput): Promise<Batch> {
  return api<Batch>("/batches", { method: "POST", body: JSON.stringify(data) });
}

export function updateBatch(id: string, data: Partial<Batch>): Promise<Batch> {
  return api<Batch>(`/batches/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function startBatch(id: string): Promise<Batch> {
  return api<Batch>(`/batches/${id}/start`, { method: "POST" });
}

export function qaBatch(id: string, body?: { quantityProduced?: number }): Promise<Batch> {
  return api<Batch>(`/batches/${id}/qa`, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

export interface CompleteBatchResponse extends Batch {
  deviceIds?: string[];
}

export function completeBatch(
  id: string,
  body?: { quantityPassedQa?: number }
): Promise<CompleteBatchResponse> {
  return api<CompleteBatchResponse>(`/batches/${id}/complete`, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

export function cancelBatch(id: string): Promise<Batch> {
  return api<Batch>(`/batches/${id}/cancel`, { method: "POST" });
}

export const BATCH_STATUS_LABEL: Record<BatchStatus, string> = {
  planned: "Planificado",
  in_progress: "En producción",
  qa: "En QA",
  completed: "Completado",
  cancelled: "Cancelado",
};

export function batchStatusVariant(s: BatchStatus): BadgeVariant {
  switch (s) {
    case "completed": return "default";
    case "in_progress":
    case "qa": return "secondary";
    case "cancelled": return "destructive";
    default: return "outline";
  }
}

// ---------- Inventory ----------
export type InventoryCategory = "device" | "component";

export interface InventoryItem {
  sku: string;
  name: string;
  category: InventoryCategory;
  onHand: number;
  reserved: number;
  reorderPoint: number;
  unitCost: number;
  needsReorder: boolean;
  updatedAt?: string;
}

export interface InventoryMovement {
  id: string;
  sku: string;
  delta: number;
  reason: string;
  refType: string | null;
  refId: string | null;
  createdAt: string;
  createdBy: string | null;
  notes: string | null;
}

export interface InventoryListResponse {
  items: InventoryItem[];
}

export interface InventoryDetailResponse {
  item: InventoryItem;
  movements: InventoryMovement[];
}

export const inventoryKeys = {
  all: ["inventory"] as const,
  list: (category?: string) => ["inventory", "list", category ?? "all"] as const,
  detail: (sku: string) => ["inventory", "detail", sku] as const,
};

export function listInventory(): Promise<InventoryListResponse> {
  return api<InventoryListResponse>("/inventory");
}

export function getInventoryItem(sku: string): Promise<InventoryDetailResponse> {
  return api<InventoryDetailResponse>(`/inventory/${encodeURIComponent(sku)}`);
}

export interface CreateInventoryInput {
  sku: string;
  name: string;
  category: InventoryCategory;
  reorderPoint: number;
  unitCost: number;
}

export function createInventoryItem(data: CreateInventoryInput): Promise<InventoryItem> {
  return api<InventoryItem>("/inventory", { method: "POST", body: JSON.stringify(data) });
}

export function updateInventoryItem(
  sku: string,
  data: Partial<InventoryItem>
): Promise<InventoryItem> {
  return api<InventoryItem>(`/inventory/${encodeURIComponent(sku)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export interface CreateMovementInput {
  sku: string;
  delta: number;
  reason: "production_in" | "shipment_out" | "adjustment" | "return";
  refType?: string;
  refId?: string;
  notes?: string;
}

export function createMovement(data: CreateMovementInput): Promise<InventoryMovement> {
  return api<InventoryMovement>("/inventory/movements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export const INVENTORY_REASON_LABEL: Record<string, string> = {
  production_in: "Entrada por producción",
  shipment_out: "Salida por envío",
  adjustment: "Ajuste",
  return: "Devolución",
};

// ---------- Shipments ----------
export type ShipmentStatus = "preparing" | "in_transit" | "delivered" | "returned";

export interface ShipmentDevice {
  id: string;
  status: string;
}

export interface Shipment {
  id: string;
  orderId: string | null;
  companyId: string;
  carrier: string;
  trackingNumber: string | null;
  status: ShipmentStatus;
  shippedAt: string | null;
  deliveredAt: string | null;
  deviceCount: number;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  devices?: ShipmentDevice[];
}

export interface ShipmentListParams {
  q?: string;
  status?: string;
  companyId?: string;
  orderId?: string;
  page?: number;
  pageSize?: number;
}

export const shipmentsKeys = {
  all: ["shipments"] as const,
  list: (filters: ShipmentListParams) => ["shipments", "list", filters] as const,
  detail: (id: string) => ["shipments", "detail", id] as const,
};

export function listShipments(params: ShipmentListParams = {}): Promise<Paginated<Shipment>> {
  return api<Paginated<Shipment>>(`/shipments${qs(params)}`);
}

export function getShipment(id: string): Promise<Shipment> {
  return api<Shipment>(`/shipments/${id}`);
}

export interface CreateShipmentInput {
  orderId?: string;
  companyId: string;
  carrier: string;
  trackingNumber?: string;
  deviceIds: string[];
}

export function createShipment(data: CreateShipmentInput): Promise<Shipment> {
  return api<Shipment>("/shipments", { method: "POST", body: JSON.stringify(data) });
}

export function updateShipment(id: string, data: Partial<Shipment>): Promise<Shipment> {
  return api<Shipment>(`/shipments/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function dispatchShipment(id: string): Promise<Shipment> {
  return api<Shipment>(`/shipments/${id}/dispatch`, { method: "POST" });
}

export function deliverShipment(id: string): Promise<Shipment> {
  return api<Shipment>(`/shipments/${id}/deliver`, { method: "POST" });
}

export function returnShipment(id: string): Promise<Shipment> {
  return api<Shipment>(`/shipments/${id}/return`, { method: "POST" });
}

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  preparing: "Preparando",
  in_transit: "En tránsito",
  delivered: "Entregado",
  returned: "Devuelto",
};

export function shipmentStatusVariant(s: ShipmentStatus): BadgeVariant {
  switch (s) {
    case "delivered": return "default";
    case "in_transit": return "secondary";
    case "returned": return "destructive";
    default: return "outline";
  }
}
