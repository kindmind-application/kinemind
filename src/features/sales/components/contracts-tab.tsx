import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, MoreVertical, XCircle } from "lucide-react";
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
  listContracts, getContract, createContract, terminateContract,
  contractsKeys,
  CONTRACT_STATUS_LABEL, contractStatusVariant, formatCOP,
  type Contract, type ContractStatus, type SalesListParams,
} from "@/lib/api/sales";
import { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 20;
const STATUSES: ContractStatus[] = ["draft", "active", "expired", "terminated"];

export function ContractsTab() {
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

  const contractsQuery = useQuery({
    queryKey: contractsKeys.list(filters),
    queryFn: () => listContracts(filters),
    placeholderData: (prev) => prev,
  });

  const companiesQuery = useQuery({
    queryKey: companiesKeys.list({ pageSize: 200 }),
    queryFn: () => listCompanies({ pageSize: 200 }),
  });

  const items = contractsQuery.data?.items ?? [];
  const total = contractsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const companies = companiesQuery.data?.items ?? [];

  const terminateMutation = useMutation({
    mutationFn: terminateContract,
    onSuccess: () => {
      toast.success("Contrato terminado");
      queryClient.invalidateQueries({ queryKey: contractsKeys.all });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (c: Contract) => <span className="text-sm font-medium">{c.id.slice(0, 8)}</span>,
    },
    {
      key: "customer",
      header: "Empresa",
      render: (c: Contract) => (
        <div>
          <div className="font-medium text-gray-900">{c.customer?.name ?? "-"}</div>
          <div className="text-xs text-gray-500">{c.customer?.nit ?? ""}</div>
        </div>
      ),
    },
    {
      key: "totalValue",
      header: "Valor total",
      render: (c: Contract) => <span className="text-sm font-medium">{formatCOP(c.totalValue)}</span>,
    },
    {
      key: "startDate",
      header: "Inicio",
      render: (c: Contract) => (
        <span className="text-sm text-gray-600">
          {c.startDate ? new Date(c.startDate).toLocaleDateString("es-CO") : "-"}
        </span>
      ),
    },
    {
      key: "endDate",
      header: "Fin",
      render: (c: Contract) => (
        <span className="text-sm text-gray-600">
          {c.endDate ? new Date(c.endDate).toLocaleDateString("es-CO") : "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (c: Contract) => (
        <Badge variant={contractStatusVariant(c.status)} className="text-xs">
          {CONTRACT_STATUS_LABEL[c.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c: Contract) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailId(c.id)}>
              <Eye className="w-4 h-4 mr-2" />Ver detalle
            </DropdownMenuItem>
            {c.status === "active" && (
              <DropdownMenuItem onClick={() => terminateMutation.mutate(c.id)}>
                <XCircle className="w-4 h-4 mr-2" />Terminar
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
                <SelectItem key={s} value={s}>{CONTRACT_STATUS_LABEL[s]}</SelectItem>
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

      <DataTable columns={columns} data={items} emptyMessage="No hay contratos" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{items.length}</span> de{" "}
          <span className="font-medium">{total}</span> contratos
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
          <Button size="sm" className="bg-[#1e3a8a] hover:bg-[#1e40af]">{page}</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Siguiente</Button>
        </div>
      </div>

      <CreateContractDialog open={createOpen} onOpenChange={setCreateOpen} companies={companies} />
      <ContractDetailSheet id={detailId} onOpenChange={(o) => !o && setDetailId(null)} />
    </div>
  );
}

function CreateContractDialog({
  open, onOpenChange, companies,
}: { open: boolean; onOpenChange: (o: boolean) => void; companies: { id: string; name: string }[] }) {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalValue, setTotalValue] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState("");

  const mutation = useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      toast.success("Contrato creado");
      queryClient.invalidateQueries({ queryKey: contractsKeys.all });
      onOpenChange(false);
      setCompanyId(""); setStartDate(""); setEndDate(""); setTotalValue(0); setPaymentTerms("");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Crear contrato</DialogTitle></DialogHeader>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Inicio</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>Fin</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Valor total (COP)</Label>
            <Input type="number" min="0" value={totalValue}
              onChange={(e) => setTotalValue(Number(e.target.value))} />
          </div>
          <div>
            <Label>Términos de pago</Label>
            <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={() => {
            if (!companyId) { toast.error("Selecciona una empresa"); return; }
            mutation.mutate({
              companyId,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
              totalValue,
              paymentTerms: paymentTerms || undefined,
              status: "draft",
            });
          }} disabled={mutation.isPending} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            {mutation.isPending ? "Creando..." : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContractDetailSheet({ id, onOpenChange }: { id: string | null; onOpenChange: (o: boolean) => void }) {
  const query = useQuery({
    queryKey: contractsKeys.detail(id ?? ""),
    queryFn: () => getContract(id!),
    enabled: !!id,
  });
  const c = query.data;
  return (
    <Sheet open={!!id} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader><SheetTitle>Detalle de contrato</SheetTitle></SheetHeader>
        {!c ? <p className="mt-6 text-sm text-gray-500">Cargando...</p> : (
          <div className="mt-6 space-y-4 text-sm">
            <div><Label className="text-gray-500">ID</Label><p className="font-mono">{c.id}</p></div>
            <div><Label className="text-gray-500">Empresa</Label><p>{c.customer?.name ?? "-"}</p></div>
            <div><Label className="text-gray-500">Estado</Label>
              <p><Badge variant={contractStatusVariant(c.status)}>{CONTRACT_STATUS_LABEL[c.status]}</Badge></p>
            </div>
            <div><Label className="text-gray-500">Valor total</Label>
              <p className="font-semibold">{formatCOP(c.totalValue)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-gray-500">Inicio</Label>
                <p>{c.startDate ? new Date(c.startDate).toLocaleDateString("es-CO") : "-"}</p>
              </div>
              <div><Label className="text-gray-500">Fin</Label>
                <p>{c.endDate ? new Date(c.endDate).toLocaleDateString("es-CO") : "-"}</p>
              </div>
            </div>
            {c.paymentTerms && (
              <div><Label className="text-gray-500">Términos</Label><p>{c.paymentTerms}</p></div>
            )}
            {c.signedAt && (
              <div><Label className="text-gray-500">Firmado</Label>
                <p>{new Date(c.signedAt).toLocaleDateString("es-CO")}</p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
