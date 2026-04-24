import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { listDevices, unassignDevice, devicesKeys } from "@/lib/api/devices";
import { dashboardKeys } from "@/lib/api/dashboard";
import type { Device } from "@/data/types";
import { ApiError } from "@/lib/api/client";

export function DevicesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filters = {
    q: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    pageSize,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: devicesKeys.list(filters),
    queryFn: () => listDevices(filters),
  });

  const unassignMutation = useMutation({
    mutationFn: (id: string) => unassignDevice(id),
    onSuccess: () => {
      toast.success("Dispositivo liberado");
      queryClient.invalidateQueries({ queryKey: devicesKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.deviceStatus });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "No fue posible liberar el dispositivo");
    },
  });

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Asignado":
        return "default";
      case "Disponible":
        return "outline";
      case "Mantenimiento":
        return "secondary";
      case "Inactivo":
        return "destructive";
      default:
        return "outline";
    }
  };

  const columns = [
    {
      key: "id",
      header: "ID Dispositivo",
      render: (device: Device) => <span className="font-medium text-gray-900">{device.id}</span>,
    },
    {
      key: "userName",
      header: "Usuario Asignado",
      render: (device: Device) => (
        <span className="text-sm text-gray-600">{device.userName ?? "-"}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (device: Device) => (
        <Badge variant={getStatusVariant(device.status)} className="text-xs">
          {device.status}
        </Badge>
      ),
    },
    {
      key: "assignmentDate",
      header: "Fecha Asignación",
      render: (device: Device) => (
        <span className="text-sm text-gray-600">
          {device.assignmentDate ? new Date(device.assignmentDate).toLocaleDateString("es-CO") : "-"}
        </span>
      ),
    },
    {
      key: "lastSync",
      header: "Última Sincronización",
      render: (device: Device) => (
        <span className="text-sm text-gray-600">{device.lastSync ?? "-"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (device: Device) =>
        device.status === "Asignado" ? (
          <Button
            variant="outline"
            size="sm"
            disabled={unassignMutation.isPending}
            onClick={() => unassignMutation.mutate(device.id)}
          >
            Liberar
          </Button>
        ) : null,
    },
  ];

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-gray-50 min-h-full">
      <PageHeader
        title="Gestión de Dispositivos"
        description="Monitoree y administre todos los dispositivos PostureBand"
        action={{
          label: "Asignar Dispositivo",
          onClick: () => navigate("/devices/assign"),
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      <div className="p-6 space-y-6">
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por ID de dispositivo..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Disponible">Disponible</SelectItem>
                <SelectItem value="Asignado">Asignado</SelectItem>
                <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {isLoading ? (
          <Card className="p-12 text-center text-gray-500">Cargando dispositivos...</Card>
        ) : isError ? (
          <Card className="p-12 text-center text-red-600">
            {error instanceof Error ? error.message : "Error al cargar dispositivos"}
          </Card>
        ) : (
          <>
            <DataTable columns={columns} data={items} emptyMessage="No se encontraron dispositivos" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando <span className="font-medium">{items.length}</span> de{" "}
                <span className="font-medium">{total}</span> dispositivos
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600 px-2 py-1">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
