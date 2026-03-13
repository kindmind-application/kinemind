import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Eye, Edit, MoreVertical, Building2, Users as UsersIcon, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { DataTable } from "@/components/shared/data-table";
import { mockCompanies } from "@/data/mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CompaniesListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");

  const totalCompanies = mockCompanies.length;
  const totalUsers = mockCompanies.reduce((sum, c) => sum + c.employeeCount, 0);
  const totalDevices = mockCompanies.reduce((sum, c) => sum + c.devicesAssigned, 0);
  const activeCompanies = mockCompanies.filter((c) => c.status === "Activa").length;

  const filteredCompanies = mockCompanies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || company.status === statusFilter;
    const matchesSector = sectorFilter === "all" || company.sector === sectorFilter;

    return matchesSearch && matchesStatus && matchesSector;
  });

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Activa": return "default";
      case "Inactiva": return "secondary";
      case "Suspendida": return "destructive";
      default: return "outline";
    }
  };

  const columns = [
    {
      key: "name",
      header: "Empresa",
      render: (company: (typeof mockCompanies)[0]) => (
        <div>
          <div className="font-medium text-gray-900">{company.name}</div>
          <div className="text-xs text-gray-500">{company.nit}</div>
        </div>
      ),
    },
    {
      key: "sector",
      header: "Sector",
      render: (company: (typeof mockCompanies)[0]) => (
        <span className="text-sm text-gray-600">{company.sector}</span>
      ),
    },
    {
      key: "city",
      header: "Ciudad",
      render: (company: (typeof mockCompanies)[0]) => (
        <span className="text-sm text-gray-600">{company.city}</span>
      ),
    },
    {
      key: "employeeCount",
      header: "Empleados",
      className: "text-center",
      render: (company: (typeof mockCompanies)[0]) => (
        <span className="text-sm font-medium text-gray-900">{company.employeeCount.toLocaleString()}</span>
      ),
    },
    {
      key: "devicesAssigned",
      header: "Dispositivos",
      className: "text-center",
      render: (company: (typeof mockCompanies)[0]) => (
        <span className="text-sm font-medium text-gray-900">{company.devicesAssigned}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (company: (typeof mockCompanies)[0]) => (
        <Badge variant={getStatusVariant(company.status)} className="text-xs">
          {company.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (company: (typeof mockCompanies)[0]) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/companies/${company.id}`)}>
              <Eye className="w-4 h-4 mr-2" />
              Ver detalle
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UsersIcon className="w-4 h-4 mr-2" />
              Ver usuarios
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-full">
      <PageHeader
        title="Gestión de Empresas"
        description="Administra las empresas clientes y su información"
        action={{
          label: "Registrar Empresa",
          onClick: () => navigate("/companies/register"),
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Empresas" value={totalCompanies} icon={Building2} iconColor="text-blue-600" />
          <StatsCard
            title="Empresas Activas"
            value={activeCompanies}
            change={{ value: `${((activeCompanies / totalCompanies) * 100).toFixed(0)}% del total`, trend: "up" }}
            icon={Building2}
            iconColor="text-green-600"
          />
          <StatsCard title="Total Usuarios" value={totalUsers.toLocaleString()} icon={UsersIcon} iconColor="text-purple-600" />
          <StatsCard title="Dispositivos" value={totalDevices} icon={Watch} iconColor="text-orange-600" />
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, NIT o ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Activa">Activa</SelectItem>
                <SelectItem value="Inactiva">Inactiva</SelectItem>
                <SelectItem value="En negociación">En negociación</SelectItem>
                <SelectItem value="Suspendida">Suspendida</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sectores</SelectItem>
                <SelectItem value="Financiero">Financiero</SelectItem>
                <SelectItem value="Tecnología">Tecnología</SelectItem>
                <SelectItem value="Salud">Salud</SelectItem>
                <SelectItem value="Alimentos">Alimentos</SelectItem>
                <SelectItem value="Construcción">Construcción</SelectItem>
                <SelectItem value="Logística">Logística</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <DataTable columns={columns} data={filteredCompanies} emptyMessage="No se encontraron empresas" />

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-medium">{filteredCompanies.length}</span> de{" "}
            <span className="font-medium">{totalCompanies}</span> empresas
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Anterior</Button>
            <Button size="sm" className="bg-[#1e3a8a] hover:bg-[#1e40af]">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">Siguiente</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
