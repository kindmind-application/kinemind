import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Eye, MoreVertical, Play, ClipboardCheck, CheckCircle2, Ban,
  Factory, PackageCheck, TrendingUp, Boxes,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { DataTable } from "@/components/shared/data-table";
import { toast } from "sonner";
import {
  listBatches, getBatch, createBatch,
  startBatch, qaBatch, completeBatch, cancelBatch,
  batchesKeys,
  BATCH_STATUS_LABEL, batchStatusVariant,
  type Batch, type BatchStatus, type BatchListParams,
} from "@/lib/api/operations";
import {
  listOrders, ordersKeys,
} from "@/lib/api/sales";
import { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 20;
const STATUSES: BatchStatus[] = ["planned", "in_progress", "qa", "completed", "cancelled"];

export function ProductionPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filters: BatchListParams = {
    q: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    pageSize: PAGE_SIZE,
  };

  const batchesQuery = useQuery({
    queryKey: batchesKeys.list(filters),
    queryFn: () => listBatches(filters),
    placeholderData: (prev) => prev,
  });

  const allBatchesQuery = useQuery({
    queryKey: batchesKeys.list({ pageSize: 500 }),
    queryFn: () => listBatches({ pageSize: 500 }),
  });

  const items = batchesQuery.data?.items ?? [];
  const total = batchesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const stats = useMemo(() => {
    const all = allBatchesQuery.data?.items ?? [];
    const inProgress = all.filter((b) => b.status === "in_progress" || b.status === "qa").length;
    const monthStart = new Date();
    monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const completedThisMonth = all.filter(
      (b) => b.status === "completed" && b.completedAt && new Date(b.completedAt) >= monthStart
    ).length;
    const totalDevices = all
      .filter((b) => b.status === "completed")
      .reduce((acc, b) => acc + b.quantityPassedQa, 0);
    return { totalBatches: all.length, inProgress, completedThisMonth, totalDevices };
  }, [allBatchesQuery.data]);

  const startMutation = useMutation({
    mutationFn: startBatch,
    onSuccess: () => {
      toast.success("Lote iniciado");
      queryClient.invalidateQueries({ queryKey: batchesKeys.all });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const qaMutation = useMutation({
    mutationFn: (id: string) => qaBatch(id),
    onSuccess: () => {
      toast.success("Lote pasó a QA");
      queryClient.invalidateQueries({ queryKey: batchesKeys.all });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeBatch(id),
    onSuccess: (data) => {
      const n = data.deviceIds?.length ?? 0;
      toast.success(`Lote completado. Se crearon ${n} dispositivos`);
      queryClient.invalidateQueries({ queryKey: batchesKeys.all });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBatch,
    onSuccess: () => {
      toast.success("Lote cancelado");
      queryClient.invalidateQueries({ queryKey: batchesKeys.all });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const yieldPct = (b: Batch) =>
    b.quantityTarget > 0 ? Math.round((b.quantityPassedQa / b.quantityTarget) * 100) : 0;

  const columns = [
    {
      key: "batchCode",
      header: "Código",
      render: (b: Batch) => <span className="font-medium text-gray-900">{b.batchCode}</span>,
    },
    {
      key: "orderId",
      header: "Pedido",
      render: (b: Batch) => (
        <span className="text-sm text-gray-600 font-mono">
          {b.orderId ? b.orderId.slice(0, 8) : "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (b: Batch) => (
        <Badge variant={batchStatusVariant(b.status)} className="text-xs">
          {BATCH_STATUS_LABEL[b.status]}
        </Badge>
      ),
    },
    {
      key: "quantityTarget",
      header: "Objetivo",
      className: "text-center",
      render: (b: Batch) => <span className="text-sm">{b.quantityTarget}</span>,
    },
    {
      key: "quantityProduced",
      header: "Producido",
      className: "text-center",
      render: (b: Batch) => <span className="text-sm">{b.quantityProduced}</span>,
    },
    {
      key: "quantityPassedQa",
      header: "QA OK",
      className: "text-center",
      render: (b: Batch) => <span className="text-sm">{b.quantityPassedQa}</span>,
    },
    {
      key: "yieldPct",
      header: "Yield",
      className: "text-center",
      render: (b: Batch) => (
        <span className="text-sm font-medium">{yieldPct(b)}%</span>
      ),
    },
    {
      key: "startedAt",
      header: "Iniciado",
      render: (b: Batch) => (
        <span className="text-sm text-gray-600">
          {b.startedAt ? new Date(b.startedAt).toLocaleDateString("es-CO") : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b: Batch) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailId(b.id)}>
              <Eye className="w-4 h-4 mr-2" />Ver
            </DropdownMenuItem>
            {b.status === "planned" && (
              <DropdownMenuItem onClick={() => startMutation.mutate(b.id)}>
                <Play className="w-4 h-4 mr-2" />Iniciar
              </DropdownMenuItem>
            )}
            {b.status === "in_progress" && (
              <>
                <DropdownMenuItem onClick={() => qaMutation.mutate(b.id)}>
                  <ClipboardCheck className="w-4 h-4 mr-2" />Marcar QA
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => cancelMutation.mutate(b.id)}>
                  <Ban className="w-4 h-4 mr-2" />Cancelar
                </DropdownMenuItem>
              </>
            )}
            {b.status === "qa" && (
              <>
                <DropdownMenuItem onClick={() => completeMutation.mutate(b.id)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />Completar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => cancelMutation.mutate(b.id)}>
                  <Ban className="w-4 h-4 mr-2" />Cancelar
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
        title="Producción"
        description="Control y seguimiento de lotes de producción"
        action={{
          label: "Crear lote",
          onClick: () => setCreateOpen(true),
          icon: <Plus className="w-4 h-4" />,
        }}
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total lotes" value={stats.totalBatches} icon={Boxes} iconColor="text-blue-600" />
          <StatsCard title="En progreso" value={stats.inProgress} icon={Factory} iconColor="text-amber-600" />
          <StatsCard title="Completados (mes)" value={stats.completedThisMonth} icon={PackageCheck} iconColor="text-green-600" />
          <StatsCard title="Dispositivos producidos" value={stats.totalDevices.toLocaleString()} icon={TrendingUp} iconColor="text-purple-600" />
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input type="search" placeholder="Buscar por código de lote..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{BATCH_STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <DataTable columns={columns} data={items} emptyMessage="No hay lotes" />

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-medium">{items.length}</span> de{" "}
            <span className="font-medium">{total}</span> lotes
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

      <CreateBatchDialog open={createOpen} onOpenChange={setCreateOpen} />
      <BatchDetailSheet id={detailId} onOpenChange={(o) => !o && setDetailId(null)} />
    </div>
  );
}

function CreateBatchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const [batchCode, setBatchCode] = useState("");
  const [orderId, setOrderId] = useState<string>("");
  const [quantityTarget, setQuantityTarget] = useState(1);
  const [notes, setNotes] = useState("");

  const ordersQuery = useQuery({
    queryKey: ordersKeys.list({ status: "pending", pageSize: 100 }),
    queryFn: () => listOrders({ status: "pending", pageSize: 100 }),
    enabled: open,
  });
  const orders = ordersQuery.data?.items ?? [];

  const mutation = useMutation({
    mutationFn: createBatch,
    onSuccess: () => {
      toast.success("Lote creado");
      queryClient.invalidateQueries({ queryKey: batchesKeys.all });
      onOpenChange(false);
      setBatchCode(""); setOrderId(""); setQuantityTarget(1); setNotes("");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Crear lote</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Código de lote</Label>
            <Input value={batchCode} onChange={(e) => setBatchCode(e.target.value)} placeholder="LOTE-001" />
          </div>
          <div>
            <Label>Pedido (opcional)</Label>
            <Select value={orderId} onValueChange={setOrderId}>
              <SelectTrigger><SelectValue placeholder="Sin pedido asociado" /></SelectTrigger>
              <SelectContent>
                {orders.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.id.slice(0, 8)} — {o.customer?.name ?? "-"} ({o.requestedDevices})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cantidad objetivo</Label>
            <Input type="number" min="1" value={quantityTarget}
              onChange={(e) => setQuantityTarget(Number(e.target.value))} />
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={() => {
            if (!batchCode) { toast.error("Indica un código de lote"); return; }
            mutation.mutate({
              batchCode,
              orderId: orderId || undefined,
              quantityTarget,
              notes: notes || undefined,
            });
          }} disabled={mutation.isPending} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            {mutation.isPending ? "Creando..." : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BatchDetailSheet({ id, onOpenChange }: { id: string | null; onOpenChange: (o: boolean) => void }) {
  const query = useQuery({
    queryKey: batchesKeys.detail(id ?? ""),
    queryFn: () => getBatch(id!),
    enabled: !!id,
  });
  const b = query.data;
  return (
    <Sheet open={!!id} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader><SheetTitle>Detalle de lote</SheetTitle></SheetHeader>
        {!b ? <p className="mt-6 text-sm text-gray-500">Cargando...</p> : (
          <div className="mt-6 space-y-4 text-sm">
            <div><Label className="text-gray-500">Código</Label><p className="font-medium">{b.batchCode}</p></div>
            <div><Label className="text-gray-500">Estado</Label>
              <p><Badge variant={batchStatusVariant(b.status)}>{BATCH_STATUS_LABEL[b.status]}</Badge></p>
            </div>
            <div><Label className="text-gray-500">Pedido</Label>
              <p className="font-mono">{b.orderId ?? "-"}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-gray-500">Objetivo</Label><p>{b.quantityTarget}</p></div>
              <div><Label className="text-gray-500">Producido</Label><p>{b.quantityProduced}</p></div>
              <div><Label className="text-gray-500">QA OK</Label><p>{b.quantityPassedQa}</p></div>
            </div>
            {b.startedAt && (
              <div><Label className="text-gray-500">Iniciado</Label>
                <p>{new Date(b.startedAt).toLocaleString("es-CO")}</p>
              </div>
            )}
            {b.completedAt && (
              <div><Label className="text-gray-500">Completado</Label>
                <p>{new Date(b.completedAt).toLocaleString("es-CO")}</p>
              </div>
            )}
            {b.notes && (
              <div><Label className="text-gray-500">Notas</Label><p>{b.notes}</p></div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
