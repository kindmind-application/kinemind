import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Edit, UserPlus, Watch, AlertCircle, Activity, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCompanies, mockUsers, mockDevices } from "@/data/mock-data";
import { StatsCard } from "@/components/shared/stats-card";
import { DataTable } from "@/components/shared/data-table";

export function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const company = mockCompanies.find((c) => c.id === id);
  const companyUsers = mockUsers.filter((u) => u.companyId === id);
  const companyDevices = mockDevices.filter((d) => d.companyId === id);

  if (!company) {
    return (
      <div className="p-6 text-center py-12">
        <p className="text-gray-500">Empresa no encontrada</p>
        <Button onClick={() => navigate("/companies")} className="mt-4">Volver a empresas</Button>
      </div>
    );
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Activa":
      case "Activo":
      case "Disponible":
        return "default";
      case "Inactiva":
      case "Inactivo":
        return "secondary";
      case "Suspendida":
        return "destructive";
      default:
        return "outline";
    }
  };

  const userColumns = [
    {
      key: "name",
      header: "Empleado",
      render: (user: (typeof mockUsers)[0]) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500">{user.document}</div>
        </div>
      ),
    },
    {
      key: "position",
      header: "Cargo",
      render: (user: (typeof mockUsers)[0]) => (
        <div>
          <div className="text-sm text-gray-900">{user.position}</div>
          <div className="text-xs text-gray-500">{user.area}</div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Correo",
      render: (user: (typeof mockUsers)[0]) => <span className="text-sm text-gray-600">{user.email}</span>,
    },
    {
      key: "status",
      header: "Estado",
      render: (user: (typeof mockUsers)[0]) => (
        <Badge variant={getStatusVariant(user.status)} className="text-xs">{user.status}</Badge>
      ),
    },
    {
      key: "deviceId",
      header: "Dispositivo",
      render: (user: (typeof mockUsers)[0]) =>
        user.deviceId ? (
          <Badge variant="outline" className="text-xs">{user.deviceId}</Badge>
        ) : (
          <span className="text-xs text-gray-400">Sin asignar</span>
        ),
    },
  ];

  const deviceColumns = [
    {
      key: "id",
      header: "ID Dispositivo",
      render: (device: (typeof mockDevices)[0]) => <span className="font-medium text-gray-900">{device.id}</span>,
    },
    {
      key: "userName",
      header: "Usuario Asignado",
      render: (device: (typeof mockDevices)[0]) => <span className="text-sm text-gray-600">{device.userName || "-"}</span>,
    },
    {
      key: "status",
      header: "Estado",
      render: (device: (typeof mockDevices)[0]) => (
        <Badge variant={getStatusVariant(device.status)} className="text-xs">{device.status}</Badge>
      ),
    },
    {
      key: "assignmentDate",
      header: "Fecha Asignación",
      render: (device: (typeof mockDevices)[0]) => (
        <span className="text-sm text-gray-600">
          {device.assignmentDate ? new Date(device.assignmentDate).toLocaleDateString("es-ES") : "-"}
        </span>
      ),
    },
    {
      key: "lastSync",
      header: "Última Sincronización",
      render: (device: (typeof mockDevices)[0]) => <span className="text-sm text-gray-600">{device.lastSync || "-"}</span>,
    },
  ];

  const activityTimeline = [
    { type: "info", title: "Dispositivo asignado", detail: "PB-001235 asignado a Laura Martínez Cruz", time: "20 de enero, 2025 - 10:30 AM" },
    { type: "success", title: "Usuario registrado", detail: "Juan Pérez Rodríguez agregado al sistema", time: "20 de enero, 2025 - 09:15 AM" },
    { type: "success", title: "Empresa registrada", detail: "Registro inicial en el sistema", time: "15 de enero, 2025 - 14:00 PM" },
  ];

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/companies")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{company.name}</h1>
                <Badge variant={getStatusVariant(company.status)}>{company.status}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">NIT: {company.nit} • {company.sector} • {company.city}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-2" />Editar</Button>
            <Link to="/users/register">
              <Button variant="outline" size="sm"><UserPlus className="w-4 h-4 mr-2" />Nuevo Usuario</Button>
            </Link>
            <Link to="/devices/assign">
              <Button size="sm" className="bg-[#1e3a8a] hover:bg-[#1e40af]"><Watch className="w-4 h-4 mr-2" />Asignar Dispositivo</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Usuarios Registrados" value={company.employeeCount} icon={Users} iconColor="text-blue-600" />
          <StatsCard title="Dispositivos Activos" value={company.devicesAssigned} icon={Watch} iconColor="text-green-600" />
          <StatsCard title="Alertas Recientes" value="3" icon={AlertCircle} iconColor="text-orange-600" />
          <StatsCard title="Última Actividad" value="2h" icon={Activity} iconColor="text-purple-600" />
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="users">Usuarios ({companyUsers.length})</TabsTrigger>
            <TabsTrigger value="devices">Dispositivos ({companyDevices.length})</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-base font-semibold">Datos de la Empresa</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Legal</p><p className="text-sm text-gray-900 mt-1">{company.name}</p></div>
                    <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</p><p className="text-sm text-gray-900 mt-1">{company.nit}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</p><p className="text-sm text-gray-900 mt-1">{company.sector}</p></div>
                    <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</p><p className="text-sm text-gray-900 mt-1">{company.size}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</p><p className="text-sm text-gray-900 mt-1">{company.city}</p></div>
                    <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</p><p className="text-sm text-gray-900 mt-1">{company.address}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</p><p className="text-sm text-gray-900 mt-1">{company.phone}</p></div>
                    <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p><p className="text-sm text-gray-900 mt-1">{company.email}</p></div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Registro</p>
                    <p className="text-sm text-gray-900 mt-1">{new Date(company.registrationDate).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-base font-semibold">Contacto Principal</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</p><p className="text-sm text-gray-900 mt-1">{company.contactName}</p></div>
                  <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</p><p className="text-sm text-gray-900 mt-1">{company.contactPosition}</p></div>
                  {company.observations && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Observaciones</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{company.observations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <DataTable columns={userColumns} data={companyUsers} emptyMessage="No hay usuarios registrados para esta empresa" />
          </TabsContent>

          <TabsContent value="devices">
            <DataTable columns={deviceColumns} data={companyDevices} emptyMessage="No hay dispositivos asignados a esta empresa" />
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-base font-semibold">Historial de Actividad</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {activityTimeline.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.type === "success" ? "bg-green-500" : activity.type === "info" ? "bg-blue-500" : "bg-gray-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{activity.detail}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
