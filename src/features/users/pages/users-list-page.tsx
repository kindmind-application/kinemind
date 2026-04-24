import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { listEmployees, employeesKeys } from "@/lib/api/employees";
import type { User } from "@/data/types";

export function UsersListPage() {
  const navigate = useNavigate();
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
    queryKey: employeesKeys.list(filters),
    queryFn: () => listEmployees(filters),
  });

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Activo":
        return "default";
      case "Inactivo":
        return "secondary";
      case "Pendiente":
        return "outline";
      default:
        return "outline";
    }
  };

  const columns = [
    {
      key: "name",
      header: "Empleado",
      render: (user: User) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500">{user.document}</div>
        </div>
      ),
    },
    {
      key: "companyName",
      header: "Empresa",
      render: (user: User) => <span className="text-sm text-gray-600">{user.companyName ?? "-"}</span>,
    },
    {
      key: "position",
      header: "Cargo",
      render: (user: User) => (
        <div>
          <div className="text-sm text-gray-900">{user.position}</div>
          <div className="text-xs text-gray-500">{user.area}</div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Correo",
      render: (user: User) => <span className="text-sm text-gray-600">{user.email}</span>,
    },
    {
      key: "status",
      header: "Estado",
      render: (user: User) => (
        <Badge variant={getStatusVariant(user.status)} className="text-xs">
          {user.status}
        </Badge>
      ),
    },
    {
      key: "deviceId",
      header: "Dispositivo",
      render: (user: User) =>
        user.deviceId ? (
          <Badge variant="outline" className="text-xs">
            {user.deviceId}
          </Badge>
        ) : (
          <span className="text-xs text-gray-400">Sin asignar</span>
        ),
    },
  ];

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-gray-50 min-h-full">
      <PageHeader
        title="Gestión de Usuarios"
        description="Administra los empleados registrados en el sistema"
        action={{
          label: "Registrar Usuario",
          onClick: () => navigate("/users/register"),
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
                  placeholder="Buscar por nombre, documento o correo..."
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
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {isLoading ? (
          <Card className="p-12 text-center text-gray-500">Cargando usuarios...</Card>
        ) : isError ? (
          <Card className="p-12 text-center text-red-600">
            {error instanceof Error ? error.message : "Error al cargar usuarios"}
          </Card>
        ) : (
          <>
            <DataTable columns={columns} data={items} emptyMessage="No se encontraron usuarios" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando <span className="font-medium">{items.length}</span> de{" "}
                <span className="font-medium">{total}</span> usuarios
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
