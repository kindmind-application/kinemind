import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, MoreVertical, Eye, Edit, ArrowUpDown,
  Package, AlertTriangle, DollarSign, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { toast } from "sonner";
import {
  listInventory, getInventoryItem, createInventoryItem, updateInventoryItem,
  createMovement,
  inventoryKeys,
  INVENTORY_REASON_LABEL,
  type InventoryItem, type InventoryCategory,
} from "@/lib/api/operations";
import { formatCOP } from "@/lib/api/sales";
import { ApiError } from "@/lib/api/client";

export function InventoryPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [movementSku, setMovementSku] = useState<string | null>(null);
  const [editSku, setEditSku] = useState<string | null>(null);
  const [detailSku, setDetailSku] = useState<string | null>(null);

  const inventoryQuery = useQuery({
    queryKey: inventoryKeys.list(),
    queryFn: listInventory,
  });

  const allItems = inventoryQuery.data?.items ?? [];
  const items = useMemo(() => {
    if (categoryFilter === "all") return allItems;
    return allItems.filter((i) => i.category === categoryFilter);
  }, [allItems, categoryFilter]);

  const stats = useMemo(() => {
    const totalSkus = allItems.length;
    const lowStock = allItems.filter((i) => i.needsReorder).length;
    const totalValue = allItems.reduce((acc, i) => acc + i.onHand * i.unitCost, 0);
    const devicesCount = allItems.filter((i) => i.category === "device").length;
    const componentsCount = allItems.filter((i) => i.category === "component").length;
    return { totalSkus, lowStock, totalValue, devicesCount, componentsCount };
  }, [allItems]);

  const editItem = editSku ? allItems.find((i) => i.sku === editSku) ?? null : null;

  return (
    <div className="bg-gray-50 min-h-full">
      <PageHeader
        title="Inventario"
        description="Gestión de SKUs, dispositivos y componentes"
        action={{
          label: "Crear SKU",
          onClick: () => setCreateOpen(true),
          icon: <Plus className="w-4 h-4" />,
        }}
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total SKUs" value={stats.totalSkus} icon={Package} iconColor="text-blue-600" />
          <StatsCard title="Stock bajo" value={stats.lowStock} icon={AlertTriangle} iconColor="text-red-600" />
          <StatsCard title="Valor en stock" value={formatCOP(stats.totalValue)} icon={DollarSign} iconColor="text-green-600" />
          <StatsCard title="Dispositivos / Componentes" value={`${stats.devicesCount} / ${stats.componentsCount}`} icon={Layers} iconColor="text-purple-600" />
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="device">Dispositivos</SelectItem>
                <SelectItem value="component">Componentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">En stock</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Reservado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Reorden</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costo unit.</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No hay items</td></tr>
                ) : items.map((item) => (
                  <tr key={item.sku} className={item.needsReorder ? "bg-red-50" : ""}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-xs">
                        {item.category === "device" ? "Dispositivo" : "Componente"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">{item.onHand}</td>
                    <td className="px-6 py-4 text-center text-sm">{item.reserved}</td>
                    <td className="px-6 py-4 text-center text-sm">{item.reorderPoint}</td>
                    <td className="px-6 py-4 text-right text-sm">{formatCOP(item.unitCost)}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setMovementSku(item.sku)}>
                            <ArrowUpDown className="w-4 h-4 mr-2" />Registrar movimiento
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditSku(item.sku)}>
                            <Edit className="w-4 h-4 mr-2" />Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDetailSku(item.sku)}>
                            <Eye className="w-4 h-4 mr-2" />Ver detalle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <CreateSkuDialog open={createOpen} onOpenChange={setCreateOpen} />
      <MovementDialog sku={movementSku} onOpenChange={(o) => !o && setMovementSku(null)} />
      <EditItemDialog item={editItem} onOpenChange={(o) => !o && setEditSku(null)} />
      <DetailDialog sku={detailSku} onOpenChange={(o) => !o && setDetailSku(null)} />
    </div>
  );
}

function CreateSkuDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("device");
  const [reorderPoint, setReorderPoint] = useState(10);
  const [unitCost, setUnitCost] = useState(0);

  const mutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      toast.success("SKU creado");
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      onOpenChange(false);
      setSku(""); setName(""); setCategory("device"); setReorderPoint(10); setUnitCost(0);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Crear SKU</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>SKU</Label><Input value={sku} onChange={(e) => setSku(e.target.value)} /></div>
          <div><Label>Nombre</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div>
            <Label>Categoría</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as InventoryCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="device">Dispositivo</SelectItem>
                <SelectItem value="component">Componente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Punto de reorden</Label>
            <Input type="number" min="0" value={reorderPoint}
              onChange={(e) => setReorderPoint(Number(e.target.value))} />
          </div>
          <div>
            <Label>Costo unitario (COP)</Label>
            <Input type="number" min="0" value={unitCost}
              onChange={(e) => setUnitCost(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={() => {
            if (!sku || !name) { toast.error("SKU y nombre son obligatorios"); return; }
            mutation.mutate({ sku, name, category, reorderPoint, unitCost });
          }} disabled={mutation.isPending} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            {mutation.isPending ? "Creando..." : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MovementDialog({ sku, onOpenChange }: { sku: string | null; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState<"production_in" | "shipment_out" | "adjustment" | "return">("adjustment");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: createMovement,
    onSuccess: () => {
      toast.success("Movimiento registrado");
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      onOpenChange(false);
      setDelta(0); setReason("adjustment"); setNotes("");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  return (
    <Dialog open={!!sku} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar movimiento — {sku}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Cantidad (positivo entra, negativo sale)</Label>
            <Input type="number" value={delta} onChange={(e) => setDelta(Number(e.target.value))} />
          </div>
          <div>
            <Label>Motivo</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as typeof reason)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(INVENTORY_REASON_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Notas</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={() => {
            if (!sku) return;
            if (!delta) { toast.error("Indica una cantidad distinta de cero"); return; }
            mutation.mutate({ sku, delta, reason, notes: notes || undefined });
          }} disabled={mutation.isPending} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            {mutation.isPending ? "Guardando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditItemDialog({ item, onOpenChange }: { item: InventoryItem | null; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [reorderPoint, setReorderPoint] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [reserved, setReserved] = useState(0);

  // Sync when item changes
  useEffect(() => {
    if (item) {
      setName(item.name);
      setReorderPoint(item.reorderPoint);
      setUnitCost(item.unitCost);
      setReserved(item.reserved);
    }
  }, [item]);

  const mutation = useMutation({
    mutationFn: ({ sku, data }: { sku: string; data: Partial<InventoryItem> }) =>
      updateInventoryItem(sku, data),
    onSuccess: () => {
      toast.success("SKU actualizado");
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar — {item?.sku}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Nombre</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div>
            <Label>Punto de reorden</Label>
            <Input type="number" min="0" value={reorderPoint}
              onChange={(e) => setReorderPoint(Number(e.target.value))} />
          </div>
          <div>
            <Label>Costo unitario</Label>
            <Input type="number" min="0" value={unitCost}
              onChange={(e) => setUnitCost(Number(e.target.value))} />
          </div>
          <div>
            <Label>Reservado</Label>
            <Input type="number" min="0" value={reserved}
              onChange={(e) => setReserved(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={() => {
            if (!item) return;
            mutation.mutate({
              sku: item.sku,
              data: { name, reorderPoint, unitCost, reserved },
            });
          }} disabled={mutation.isPending} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailDialog({ sku, onOpenChange }: { sku: string | null; onOpenChange: (o: boolean) => void }) {
  const query = useQuery({
    queryKey: inventoryKeys.detail(sku ?? ""),
    queryFn: () => getInventoryItem(sku!),
    enabled: !!sku,
  });
  const data = query.data;

  return (
    <Dialog open={!!sku} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Detalle — {sku}</DialogTitle></DialogHeader>
        {!data ? <p className="text-sm text-gray-500">Cargando...</p> : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-gray-500">Nombre</Label><p>{data.item.name}</p></div>
              <div><Label className="text-gray-500">Categoría</Label><p>{data.item.category}</p></div>
              <div><Label className="text-gray-500">En stock</Label><p>{data.item.onHand}</p></div>
              <div><Label className="text-gray-500">Reservado</Label><p>{data.item.reserved}</p></div>
              <div><Label className="text-gray-500">Punto de reorden</Label><p>{data.item.reorderPoint}</p></div>
              <div><Label className="text-gray-500">Costo unitario</Label><p>{formatCOP(data.item.unitCost)}</p></div>
            </div>
            <div>
              <Label className="text-gray-500">Últimos movimientos</Label>
              <table className="w-full mt-2 text-xs border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left">Fecha</th>
                    <th className="px-2 py-1 text-right">Δ</th>
                    <th className="px-2 py-1 text-left">Motivo</th>
                    <th className="px-2 py-1 text-left">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {data.movements.length === 0 ? (
                    <tr><td colSpan={4} className="px-2 py-2 text-center text-gray-500">Sin movimientos</td></tr>
                  ) : data.movements.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="px-2 py-1">{new Date(m.createdAt).toLocaleString("es-CO")}</td>
                      <td className={`px-2 py-1 text-right ${m.delta < 0 ? "text-red-600" : "text-green-600"}`}>
                        {m.delta > 0 ? "+" : ""}{m.delta}
                      </td>
                      <td className="px-2 py-1">{INVENTORY_REASON_LABEL[m.reason] ?? m.reason}</td>
                      <td className="px-2 py-1">{m.notes ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
