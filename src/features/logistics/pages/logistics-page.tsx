import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Eye, MoreVertical, Truck, CheckCircle2, RotateCcw, Edit,
  PackageCheck, PackageOpen, Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { DataTable } from "@/components/shared/data-table";
import { toast } from "sonner";
import { listCompanies, companiesKeys } from "@/lib/api/companies";
import { listDevices, devicesKeys } from "@/lib/api/devices";
import {
  listShipments, getShipment, createShipment, updateShipment,
  dispatchShipment, deliverShipment, returnShipment,
  shipmentsKeys,
  SHIPMENT_STATUS_LABEL, shipmentStatusVariant,
  type Shipment, type ShipmentStatus, type ShipmentListParams,
} from "@/lib/api/operations";
import { getShipmentOTD, dashboardKeys } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 20;
const STATUSES: ShipmentStatus[] = ["preparing", "in_transit", "delivered", "returned"];

export function LogisticsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const filters: ShipmentListParams = {
    q: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    companyId: companyFilter === "all" ? undefined : companyFilter,
    page,
    pageSize: PAGE_SIZE,
  };

  const shipmentsQuery = useQuery({
    queryKey: shipmentsKeys.list(filters),
    queryFn: () => listShipments(filters),
    placeholderData: (prev) => prev,
  });

  const allShipmentsQuery = useQuery({
    queryKey: shipmentsKeys.list({ pageSize: 500 }),
    queryFn: () => listShipments({ pageSize: 500 }),
  });

  const otdQuery = useQuery({
    queryKey: dashboardKeys.shipmentOTD,
    queryFn: getShipmentOTD,
  });

  const companiesQuery = useQuery({
    queryKey: companiesKeys.list({ pageSize: 200 }),
    queryFn: () => listCompanies({ pageSize: 200 }),
  });

  const items = shipmentsQuery.data?.items ?? [];
  const total = shipmentsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const companies = companiesQuery.data?.items ?? [];

  const stats = (() => {
    const all = allShipmentsQuery.data?.items ?? [];
    const inTransit = all.filter((s) => s.status === "in_transit").length;
    const monthStart = new Date();
    monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const deliveredThisMonth = all.filter(
      (s) => s.status === "delivered" && s.deliveredAt && new Date(s.deliveredAt) >= monthStart
    ).length;
    return { totalShipments: all.length, inTransit, deliveredThisMonth };
  })();

  const dispatchM = useMutation({
    mutationFn: dispatchShipment,
    onSuccess: () => {
      toast.success("Envío despachado");
      queryClient.invalidateQueries({ queryKey: shipmentsKeys.all });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const deliverM = useMutation({
    mutationFn: deliverShipment,
    onSuccess: () => {
      toast.success("Envío entregado");
      queryClient.invalidateQueries({ queryKey: shipmentsKeys.all });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const returnM = useMutation({
    mutationFn: returnShipment,
    onSuccess: () => {
      toast.success("Envío devuelto");
      queryClient.invalidateQueries({ queryKey: shipmentsKeys.all });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (s: Shipment) => <span className="text-sm font-medium">{s.id.slice(0, 8)}</span>,
    },
    {
      key: "customer",
      header: "Empresa",
      render: (s: Shipment) => (
        <span className="text-sm text-gray-700">{s.customer?.name ?? "-"}</span>
      ),
    },
    {
      key: "carrier",
      header: "Transportadora",
      render: (s: Shipment) => <span className="text-sm">{s.carrier}</span>,
    },
    {
      key: "trackingNumber",
      header: "Tracking",
      render: (s: Shipment) => (
        <span className="text-sm font-mono text-gray-600">{s.trackingNumber ?? "-"}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (s: Shipment) => (
        <Badge variant={shipmentStatusVariant(s.status)} className="text-xs">
          {SHIPMENT_STATUS_LABEL[s.status]}
        </Badge>
      ),
    },
    {
      key: "deviceCount",
      header: "Dispositivos",
      className: "text-center",
      render: (s: Shipment) => <span className="text-sm font-medium">{s.deviceCount}</span>,
    },
    {
      key: "shippedAt",
      header: "Despachado",
      render: (s: Shipment) => (
        <span className="text-sm text-gray-600">
          {s.shippedAt ? new Date(s.shippedAt).toLocaleDateString("es-CO") : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s: Shipment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailId(s.id)}>
              <Eye className="w-4 h-4 mr-2" />Ver
            </DropdownMenuItem>
            {s.status === "preparing" && (
              <>
                <DropdownMenuItem onClick={() => dispatchM.mutate(s.id)}>
                  <Truck className="w-4 h-4 mr-2" />Despachar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditId(s.id)}>
                  <Edit className="w-4 h-4 mr-2" />Editar
                </DropdownMenuItem>
              </>
            )}
            {s.status === "in_transit" && (
              <>
                <DropdownMenuItem onClick={() => deliverM.mutate(s.id)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />Marcar entregado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => returnM.mutate(s.id)}>
                  <RotateCcw className="w-4 h-4 mr-2" />Marcar devuelto
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-full">
      <PageHeader
        title="Logística"
        description="Seguimiento de envíos y distribución de dispositivos"
        action={{
          label: "Crear envío",
          onClick: () => setCreateOpen(true),
          icon: <Plus className="w-4 h-4" />,
        }}
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total envíos" value={stats.totalShipments} icon={PackageOpen} iconColor="text-blue-600" />
          <StatsCard title="En tránsito" value={stats.inTransit} icon={Truck} iconColor="text-amber-600" />
          <StatsCard title="Entregados (mes)" value={stats.deliveredThisMonth} icon={PackageCheck} iconColor="text-green-600" />
          <StatsCard title="On-time delivery"
            value={otdQuery.data ? `${Math.round(otdQuery.data.onTimePct)}%` : "-"}
            icon={Percent} iconColor="text-purple-600" />
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input type="search" placeholder="Buscar por ID o tracking..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{SHIPMENT_STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={companyFilter} onValueChange={(v) => { setCompanyFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-56"><SelectValue placeholder="Empresa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <DataTable columns={columns} data={items} emptyMessage="No hay envíos" />

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-medium">{items.length}</span> de{" "}
            <span className="font-medium">{total}</span> envíos
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
            <Button size="sm" className="bg-[#1e3a8a] hover:bg-[#1e40af]">{page}</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Siguiente</Button>
          </div>
        </div>
      </div>

      <CreateShipmentDialog open={createOpen} onOpenChange={setCreateOpen} companies={companies} />
      <ShipmentDetailSheet id={detailId} onOpenChange={(o) => !o && setDetailId(null)} />
      <EditShipmentDialog id={editId} onOpenChange={(o) => !o && setEditId(null)} />
    </div>
  );
}

function CreateShipmentDialog({
  open, onOpenChange, companies,
}: { open: boolean; onOpenChange: (o: boolean) => void; companies: { id: string; name: string }[] }) {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [deviceIds, setDeviceIds] = useState<string[]>([]);

  const devicesQuery = useQuery({
    queryKey: devicesKeys.list({ status: "Disponible", pageSize: 500 }),
    queryFn: () => listDevices({ status: "Disponible", pageSize: 500 }),
    enabled: open,
  });
  const devices = devicesQuery.data?.items ?? [];

  const mutation = useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      toast.success("Envío creado");
      queryClient.invalidateQueries({ queryKey: shipmentsKeys.all });
      onOpenChange(false);
      setCompanyId(""); setOrderId(""); setCarrier(""); setTrackingNumber(""); setDeviceIds([]);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const toggleDevice = (id: string) => {
    setDeviceIds((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Crear envío</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Empresa</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>ID de pedido (opcional)</Label>
            <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="UUID del pedido" />
          </div>
          <div>
            <Label>Transportadora</Label>
            <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Servientrega, Coordinadora..." />
          </div>
          <div>
            <Label>Número de tracking</Label>
            <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
          </div>
          <div>
            <Label>Dispositivos disponibles ({deviceIds.length} seleccionados)</Label>
            <div className="mt-2 max-h-48 overflow-y-auto border rounded p-2 space-y-1">
              {devices.length === 0 ? (
                <p className="text-sm text-gray-500">No hay dispositivos disponibles</p>
              ) : devices.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={deviceIds.includes(d.id)}
                    onChange={() => toggleDevice(d.id)}
                  />
                  <span className="font-mono">{d.id}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={() => {
            if (!companyId) { toast.error("Selecciona una empresa"); return; }
            if (!carrier) { toast.error("Indica la transportadora"); return; }
            if (deviceIds.length === 0) { toast.error("Selecciona al menos un dispositivo"); return; }
            mutation.mutate({
              companyId,
              orderId: orderId || undefined,
              carrier,
              trackingNumber: trackingNumber || undefined,
              deviceIds,
            });
          }} disabled={mutation.isPending} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            {mutation.isPending ? "Creando..." : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditShipmentDialog({ id, onOpenChange }: { id: string | null; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: shipmentsKeys.detail(id ?? ""),
    queryFn: () => getShipment(id!),
    enabled: !!id,
  });
  const s = query.data;
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    if (s) {
      setCarrier(s.carrier);
      setTrackingNumber(s.trackingNumber ?? "");
    }
  }, [s]);

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Shipment> }) => updateShipment(id, data),
    onSuccess: () => {
      toast.success("Envío actualizado");
      queryClient.invalidateQueries({ queryKey: shipmentsKeys.all });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  return (
    <Dialog open={!!id} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar envío</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Transportadora</Label>
            <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} />
          </div>
          <div><Label>Tracking</Label>
            <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={() => {
            if (!id) return;
            mutation.mutate({ id, data: { carrier, trackingNumber } });
          }} disabled={mutation.isPending} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShipmentDetailSheet({ id, onOpenChange }: { id: string | null; onOpenChange: (o: boolean) => void }) {
  const query = useQuery({
    queryKey: shipmentsKeys.detail(id ?? ""),
    queryFn: () => getShipment(id!),
    enabled: !!id,
  });
  const s = query.data;
  return (
    <Sheet open={!!id} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader><SheetTitle>Detalle de envío</SheetTitle></SheetHeader>
        {!s ? <p className="mt-6 text-sm text-gray-500">Cargando...</p> : (
          <div className="mt-6 space-y-4 text-sm">
            <div><Label className="text-gray-500">ID</Label><p className="font-mono">{s.id}</p></div>
            <div><Label className="text-gray-500">Empresa</Label><p>{s.customer?.name ?? "-"}</p></div>
            <div><Label className="text-gray-500">Estado</Label>
              <p><Badge variant={shipmentStatusVariant(s.status)}>{SHIPMENT_STATUS_LABEL[s.status]}</Badge></p>
            </div>
            <div><Label className="text-gray-500">Transportadora</Label><p>{s.carrier}</p></div>
            <div><Label className="text-gray-500">Tracking</Label>
              <p className="font-mono">{s.trackingNumber ?? "-"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-gray-500">Despachado</Label>
                <p>{s.shippedAt ? new Date(s.shippedAt).toLocaleString("es-CO") : "-"}</p>
              </div>
              <div><Label className="text-gray-500">Entregado</Label>
                <p>{s.deliveredAt ? new Date(s.deliveredAt).toLocaleString("es-CO") : "-"}</p>
              </div>
            </div>
            <div>
              <Label className="text-gray-500">Dispositivos ({s.devices?.length ?? s.deviceCount})</Label>
              <ul className="mt-2 space-y-1 text-xs font-mono">
                {(s.devices ?? []).map((d) => (
                  <li key={d.id} className="flex justify-between border-b py-1">
                    <span>{d.id}</span>
                    <span className="text-gray-500">{d.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
