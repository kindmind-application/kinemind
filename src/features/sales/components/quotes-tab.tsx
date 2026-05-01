import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, MoreVertical, Send, CheckCircle2, FileText } from "lucide-react";
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
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { DataTable } from "@/components/shared/data-table";
import { toast } from "sonner";
import { listCompanies, companiesKeys } from "@/lib/api/companies";
import {
  listQuotes, getQuote, createQuote, updateQuote,
  quotesKeys, contractsKeys,
  QUOTE_STATUS_LABEL, quoteStatusVariant, formatCOP,
  createContract,
  type Quote, type QuoteStatus, type SalesListParams,
} from "@/lib/api/sales";
import { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 20;
const STATUSES: QuoteStatus[] = ["draft", "sent", "accepted", "rejected", "expired"];

export function QuotesTab() {
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

  const quotesQuery = useQuery({
    queryKey: quotesKeys.list(filters),
    queryFn: () => listQuotes(filters),
    placeholderData: (prev) => prev,
  });

  const companiesQuery = useQuery({
    queryKey: companiesKeys.list({ pageSize: 200 }),
    queryFn: () => listCompanies({ pageSize: 200 }),
  });

  const items = quotesQuery.data?.items ?? [];
  const total = quotesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const companies = companiesQuery.data?.items ?? [];

  const sendMutation = useMutation({
    mutationFn: (id: string) => updateQuote(id, { status: "sent" }),
    onSuccess: () => {
      toast.success("Cotización marcada como enviada");
      queryClient.invalidateQueries({ queryKey: quotesKeys.all });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => updateQuote(id, { status: "accepted" }),
    onSuccess: () => {
      toast.success("Cotización aceptada");
      queryClient.invalidateQueries({ queryKey: quotesKeys.all });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const toContractMutation = useMutation({
    mutationFn: async (q: Quote) => {
      return createContract({
        companyId: q.companyId,
        quoteId: q.id,
        totalValue: q.total,
        status: "draft",
      });
    },
    onSuccess: () => {
      toast.success("Contrato creado desde cotización");
      queryClient.invalidateQueries({ queryKey: contractsKeys.all });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (q: Quote) => (
        <span className="text-sm font-medium text-gray-900">{q.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "customer",
      header: "Empresa",
      render: (q: Quote) => (
        <div>
          <div className="font-medium text-gray-900">{q.customer?.name ?? "-"}</div>
          <div className="text-xs text-gray-500">{q.customer?.nit ?? ""}</div>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (q: Quote) => (
        <span className="text-sm font-medium text-gray-900">{formatCOP(q.total)}</span>
      ),
    },
    {
      key: "validUntil",
      header: "Válido hasta",
      render: (q: Quote) => (
        <span className="text-sm text-gray-600">
          {q.validUntil ? new Date(q.validUntil).toLocaleDateString("es-CO") : "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (q: Quote) => (
        <Badge variant={quoteStatusVariant(q.status)} className="text-xs">
          {QUOTE_STATUS_LABEL[q.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (q: Quote) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailId(q.id)}>
              <Eye className="w-4 h-4 mr-2" />
              Ver detalle
            </DropdownMenuItem>
            {q.status === "draft" && (
              <DropdownMenuItem onClick={() => sendMutation.mutate(q.id)}>
                <Send className="w-4 h-4 mr-2" />
                Marcar enviada
              </DropdownMenuItem>
            )}
            {q.status === "sent" && (
              <DropdownMenuItem onClick={() => acceptMutation.mutate(q.id)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aceptar
              </DropdownMenuItem>
            )}
            {q.status === "accepted" && (
              <DropdownMenuItem onClick={() => toContractMutation.mutate(q)}>
                <FileText className="w-4 h-4 mr-2" />
                Crear contrato
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
            <Input
              type="search"
              placeholder="Buscar por ID o empresa..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{QUOTE_STATUS_LABEL[s]}</SelectItem>
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
            <Plus className="w-4 h-4 mr-2" />
            Crear
          </Button>
        </div>
      </Card>

      <DataTable columns={columns} data={items} emptyMessage="No hay cotizaciones" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{items.length}</span> de{" "}
          <span className="font-medium">{total}</span> cotizaciones
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
          <Button size="sm" className="bg-[#1e3a8a] hover:bg-[#1e40af]">{page}</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Siguiente</Button>
        </div>
      </div>

      <CreateQuoteDialog open={createOpen} onOpenChange={setCreateOpen} companies={companies} />
      <QuoteDetailSheet id={detailId} onOpenChange={(o) => !o && setDetailId(null)} />
    </div>
  );
}

interface CreateQuoteDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  companies: { id: string; name: string }[];
}

interface DraftLine {
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

function CreateQuoteDialog({ open, onOpenChange, companies }: CreateQuoteDialogProps) {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([
    { sku: "", description: "", quantity: 1, unitPrice: 0 },
  ]);

  const mutation = useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      toast.success("Cotización creada");
      queryClient.invalidateQueries({ queryKey: quotesKeys.all });
      onOpenChange(false);
      reset();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Error"),
  });

  const reset = () => {
    setCompanyId("");
    setValidUntil("");
    setNotes("");
    setLines([{ sku: "", description: "", quantity: 1, unitPrice: 0 }]);
  };

  const addLine = () => setLines((ls) => [...ls, { sku: "", description: "", quantity: 1, unitPrice: 0 }]);
  const removeLine = (i: number) => setLines((ls) => ls.filter((_, idx) => idx !== i));
  const updateLine = (i: number, patch: Partial<DraftLine>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const handleSubmit = () => {
    if (!companyId) {
      toast.error("Selecciona una empresa");
      return;
    }
    mutation.mutate({
      companyId,
      validUntil: validUntil || undefined,
      currency: "COP",
      notes: notes || undefined,
      items: lines.map((l) => ({
        sku: l.sku,
        description: l.description,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear cotización</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Empresa</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Válido hasta</Label>
            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          <div>
            <Label>Líneas</Label>
            <div className="space-y-2 mt-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-2">
                    <Input placeholder="SKU" value={l.sku}
                      onChange={(e) => updateLine(i, { sku: e.target.value })} />
                  </div>
                  <div className="col-span-4">
                    <Input placeholder="Descripción" value={l.description}
                      onChange={(e) => updateLine(i, { description: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min="1" placeholder="Qty" value={l.quantity}
                      onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })} />
                  </div>
                  <div className="col-span-3">
                    <Input type="number" min="0" placeholder="Precio" value={l.unitPrice}
                      onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })} />
                  </div>
                  <div className="col-span-1">
                    {lines.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => removeLine(i)}>X</Button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addLine}>
                <Plus className="w-4 h-4 mr-1" /> Línea
              </Button>
            </div>
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={mutation.isPending}
            className="bg-[#1e3a8a] hover:bg-[#1e40af]">
            {mutation.isPending ? "Creando..." : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuoteDetailSheet({ id, onOpenChange }: { id: string | null; onOpenChange: (o: boolean) => void }) {
  const query = useQuery({
    queryKey: quotesKeys.detail(id ?? ""),
    queryFn: () => getQuote(id!),
    enabled: !!id,
  });
  const q = query.data;
  return (
    <Sheet open={!!id} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Detalle de cotización</SheetTitle>
        </SheetHeader>
        {!q ? (
          <p className="mt-6 text-sm text-gray-500">Cargando...</p>
        ) : (
          <div className="mt-6 space-y-4 text-sm">
            <div>
              <Label className="text-gray-500">ID</Label>
              <p className="font-mono">{q.id}</p>
            </div>
            <div>
              <Label className="text-gray-500">Empresa</Label>
              <p>{q.customer?.name ?? "-"}</p>
            </div>
            <div>
              <Label className="text-gray-500">Estado</Label>
              <p><Badge variant={quoteStatusVariant(q.status)}>{QUOTE_STATUS_LABEL[q.status]}</Badge></p>
            </div>
            <div>
              <Label className="text-gray-500">Total</Label>
              <p className="font-semibold">{formatCOP(q.total)}</p>
            </div>
            <div>
              <Label className="text-gray-500">Líneas</Label>
              <table className="w-full mt-2 text-xs border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left">SKU</th>
                    <th className="px-2 py-1 text-left">Descripción</th>
                    <th className="px-2 py-1 text-right">Qty</th>
                    <th className="px-2 py-1 text-right">Precio</th>
                    <th className="px-2 py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(q.items ?? []).map((it) => (
                    <tr key={it.lineNo} className="border-t">
                      <td className="px-2 py-1">{it.sku}</td>
                      <td className="px-2 py-1">{it.description}</td>
                      <td className="px-2 py-1 text-right">{it.quantity}</td>
                      <td className="px-2 py-1 text-right">{formatCOP(it.unitPrice)}</td>
                      <td className="px-2 py-1 text-right">{formatCOP(it.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {q.notes && (
              <div>
                <Label className="text-gray-500">Notas</Label>
                <p className="text-gray-700">{q.notes}</p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
