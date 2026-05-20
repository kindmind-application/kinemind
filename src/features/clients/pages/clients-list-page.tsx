import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";

import {
  clientsKeys,
  createClient,
  deactivateClient,
  listClients,
  type ClientAdmin,
} from "@/lib/api/clients";
import { listCompanies, companiesKeys } from "@/lib/api/companies";
import { ApiError } from "@/lib/api/client";

export function ClientsListPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const clientsQuery = useQuery({
    queryKey: clientsKeys.list(),
    queryFn: listClients,
  });

  const companiesQuery = useQuery({
    queryKey: companiesKeys.list({ pageSize: 200 }),
    queryFn: () => listCompanies({ pageSize: 200 }),
    enabled: isCreateOpen,
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateClient,
    onSuccess: () => {
      toast.success("Cliente desactivado");
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Error al desactivar cliente";
      toast.error(msg);
    },
  });

  const columns = useMemo(
    () => [
      {
        key: "company",
        header: "Empresa",
        render: (c: ClientAdmin) => (
          <div className="font-medium text-gray-900">{c.companyName}</div>
        ),
      },
      {
        key: "username",
        header: "Usuario",
        render: (c: ClientAdmin) => (
          <div>
            <div className="text-sm text-gray-900">{c.username}</div>
            <div className="text-xs text-gray-500">{c.displayName}</div>
          </div>
        ),
      },
      {
        key: "createdAt",
        header: "Creado",
        render: (c: ClientAdmin) => (
          <span className="text-sm text-gray-600">
            {new Date(c.createdAt).toLocaleDateString("es-CO")}
          </span>
        ),
      },
      {
        key: "lastLoginAt",
        header: "Último acceso",
        render: (c: ClientAdmin) => (
          <span className="text-sm text-gray-600">
            {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleString("es-CO") : "Nunca"}
          </span>
        ),
      },
      {
        key: "isActive",
        header: "Estado",
        render: (c: ClientAdmin) => (
          <Badge variant={c.isActive ? "default" : "secondary"}>
            {c.isActive ? "Activo" : "Desactivado"}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "",
        render: (c: ClientAdmin) =>
          c.isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm(`¿Desactivar acceso de ${c.username}?`)) {
                  deactivateMutation.mutate(c.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          ) : null,
      },
    ],
    [deactivateMutation]
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader
        title="Clientes"
        description="Cuentas de empresas que acceden a su propio panel."
        action={{
          label: "Nuevo cliente",
          onClick: () => setIsCreateOpen(true),
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      <div className="p-6">
        {clientsQuery.isLoading ? (
          <Card className="p-12 text-center text-gray-500">Cargando…</Card>
        ) : clientsQuery.isError ? (
          <Card className="p-12 text-center text-red-600">
            Error al cargar clientes
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={clientsQuery.data ?? []}
            emptyMessage="Aún no hay cuentas de cliente. Crea una con el botón Nuevo cliente."
          />
        )}
      </div>

      <CreateClientDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        companies={companiesQuery.data?.items ?? []}
        companiesLoading={companiesQuery.isLoading}
      />
    </div>
  );
}

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companies: { id: string; name: string }[];
  companiesLoading: boolean;
}

function CreateClientDialog({
  open,
  onOpenChange,
  companies,
  companiesLoading,
}: CreateClientDialogProps) {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  const reset = () => {
    setCompanyId("");
    setUsername("");
    setDisplayName("");
    setPassword("");
  };

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("Cliente creado");
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
      reset();
      onOpenChange(false);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Error al crear cliente";
      toast.error(msg);
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!companyId || !username || !password) {
      toast.error("Empresa, usuario y contraseña son obligatorios");
      return;
    }
    mutation.mutate({
      companyId,
      username: username.trim(),
      displayName: displayName.trim() || undefined,
      password,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva cuenta de cliente</DialogTitle>
          <DialogDescription>
            Crea un usuario que sólo verá los datos de su empresa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Select value={companyId} onValueChange={setCompanyId} disabled={companiesLoading}>
              <SelectTrigger id="company">
                <SelectValue placeholder={companiesLoading ? "Cargando…" : "Selecciona una empresa"} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="empresa_admin"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Nombre a mostrar (opcional)</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Admin de la empresa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#1e3a8a] hover:bg-[#1e40af]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creando…" : "Crear cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
