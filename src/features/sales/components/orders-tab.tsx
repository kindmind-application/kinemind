import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, MoreVertical, Ban } from "lucide-react";
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
import { DataTable } from "@/components/shared/data-table";
import { toast } from "sonner";
import { listCompanies, companiesKeys } from "@/lib/api/companies";
import {
  listOrders, getOrder, createOrder, cancelOrder,
  listContracts, contractsKeys,
  ordersKeys,
  ORDER_STATUS_LABEL, orderStatusVariant,
  type Order, type OrderStatus, type SalesListParams,
} from "@/lib/api/sales";
import { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 20;
const STATUSES: OrderStatus[] = [
  "pending", "in_production", "ready_to_ship", "shipped", "delivered", "cancelled",
];

export function OrdersTab() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filters: SalesListParams = {
    q: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    companyId: companyFilter === "all" ? undefined : companyFilter,
    page,
    pageSize: PAGE_SIZE,
  };

  const ordersQuery = useQuery({
    queryKey: ordersKeys.list(filters),
    queryFn: () => listOrders(filters),
    placeholderData: (prev) => prev,
  });

  const companiesQuery = useQuery({
    queryKey: companiesKeys.list({ pageSize: 200 }),
    queryFn: () => listCompanies({ pageSize: 200 }),
  });

  const items = ordersQuery.data?.items ?? [];
  const total = ordersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const companies = companiesQuery.data?.items ?? [];

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success("Pedido cancelado");
      queryClient.invalidateQueries({ queryKey: ordersKeys.all });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (o: Order) => <span className="text-sm font-medium">{o.id.slice(0, 8)}</span>,
    },
    {
      key: "customer",
      header: "Empresa",
      render: (o: Order) => (
        <div>
          <div className="font-medium text-gray-900">{o.customer?.name ?? "-"}</div>
          <div className="text-xs text-gray-500">{o.customer?.nit ?? ""}</div>
        </div>
      ),
    },
    {
      key: "requestedDevices",
      header: "Dispositivos",
      className: "text-center",
      render: (o: Order) => <span className="text-sm font-medium">{o.requestedDevices}</span>,
    },
    {
      key: "requestedDeliveryDate",
      header: "Entrega",
      render: (o: Order) => (
        <span className="text-sm text-gray-600">
          {o.requestedDeliveryDate
            ? new Date(o.requestedDeliveryDate).toLocaleDateString("es-CO")
            : "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (o: Order) => (
        <Badge variant={orderStatusVariant(o.status)} className="text-xs">
          {ORDER_STATUS_LABEL[o.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (o: Order) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailId(o.id)}>
              <Eye className="w-4 h-4 mr-2" />Ver detalle
            </DropdownMenuItem>
            {o.status !== "cancelled" && o.status !== "delivered" && (
              <DropdownMenuItem onClick={() => cancelMutation.mutate(o.id)}>
                <Ban className="w-4 h-4 mr-2" />Cancelar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input type="search" placeholder="Buscar por ID o empresa..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{ORDER_STATUS_LABEL[s]}</SelectItem>
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
          <Button onClick={() => setCreateOpen(true)} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            <Plus className="w-4 h-4 mr-2" />Crear
          </Button>
        </div>
      </Card>

      <DataTable columns={columns} data={items} emptyMessage="No hay pedidos" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{items.length}</span> de{" "}
          <span className="font-medium">{total}</span> pedidos
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
          <Button size="sm" className="bg-[#1e3a8a] hover:bg-[#1e40af]">{page}</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Siguiente</Button>
        </div>
      </div>

      <CreateOrderDialog open={createOpen} onOpenChange={setCreateOpen} companies={companies} />
      <OrderDetailSheet id={detailId} onOpenChange={(o) => !o && setDetailId(null)} />
    </div>
  );
}

function CreateOrderDialog({
  open, onOpenChange, companies,
}: { open: boolean; onOpenChange: (o: boolean) => void; companies: { id: string; name: string }[] }) {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState("");
  const [contractId, setContractId] = useState<string>("");
  const [requestedDevices, setRequestedDevices] = useState(1);
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState("");

  const contractsQuery = useQuery({
    queryKey: contractsKeys.list({ companyId: companyId || undefined, status: "active", pageSize: 100 }),
    queryFn: () => listContracts({ companyId: companyId || undefined, status: "active", pageSize: 100 }),
    enabled: !!companyId,
  });
  const contracts = contractsQuery.data?.items ?? [];

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.success("Pedido creado");
      queryClient.invalidateQueries({ queryKey: ordersKeys.all });
      onOpenChange(false);
      setCompanyId(""); setContractId(""); setRequestedDevices(1); setRequestedDeliveryDate("");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Crear pedido</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Empresa</Label>
            <Select value={companyId} onValueChange={(v) => { setCompanyId(v); setContractId(""); }}>
              <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Contrato (opcional)</Label>
            <Select value={contractId} onValueChange={setContractId} disabled={!companyId}>
              <SelectTrigger><SelectValue placeholder="Sin contrato" /></SelectTrigger>
              <SelectContent>
                {contracts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.id.slice(0, 8)} — {c.totalValue}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cantidad de dispositivos</Label>
            <Input type="number" min="1" value={requestedDevices}
              onChange={(e) => setRequestedDevices(Number(e.target.value))} />
          </div>
          <div>
            <Label>Fecha de entrega solicitada</Label>
            <Input type="date" value={requestedDeliveryDate}
              onChange={(e) => setRequestedDeliveryDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={() => {
            if (!companyId) { toast.error("Selecciona una empresa"); return; }
            mutation.mutate({
              companyId,
              contractId: contractId || undefined,
              requestedDevices,
              requestedDeliveryDate: requestedDeliveryDate || undefined,
              status: "pending",
            });
          }} disabled={mutation.isPending} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            {mutation.isPending ? "Creando..." : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrderDetailSheet({ id, onOpenChange }: { id: string | null; onOpenChange: (o: boolean) => void }) {
  const query = useQuery({
    queryKey: ordersKeys.detail(id ?? ""),
    queryFn: () => getOrder(id!),
    enabled: !!id,
  });
  const o = query.data;
  return (
    <Sheet open={!!id} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader><SheetTitle>Detalle de pedido</SheetTitle></SheetHeader>
        {!o ? <p className="mt-6 text-sm text-gray-500">Cargando...</p> : (
          <div className="mt-6 space-y-4 text-sm">
            <div><Label className="text-gray-500">ID</Label><p className="font-mono">{o.id}</p></div>
            <div><Label className="text-gray-500">Empresa</Label><p>{o.customer?.name ?? "-"}</p></div>
            <div><Label className="text-gray-500">Contrato</Label>
              <p className="font-mono">{o.contractId ?? "-"}</p>
            </div>
            <div><Label className="text-gray-500">Estado</Label>
              <p><Badge variant={orderStatusVariant(o.status)}>{ORDER_STATUS_LABEL[o.status]}</Badge></p>
            </div>
            <div><Label className="text-gray-500">Dispositivos solicitados</Label>
              <p className="font-semibold">{o.requestedDevices}</p>
            </div>
            <div><Label className="text-gray-500">Fecha de entrega</Label>
              <p>{o.requestedDeliveryDate ? new Date(o.requestedDeliveryDate).toLocaleDateString("es-CO") : "-"}</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
