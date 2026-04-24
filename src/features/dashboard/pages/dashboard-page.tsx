import { Building2, Users, Watch, Activity, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { mockCompanies, mockUsers, mockDevices } from "@/data/mock-data";
import { StatsCard } from "@/components/shared/stats-card";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#1e3a8a", "#3b82f6", "#60a5fa", "#93c5fd"];

export function DashboardPage() {
  const activeCompanies = mockCompanies.filter((c) => c.status === "Activa").length;
  const totalUsers = mockUsers.length;
  const assignedDevices = mockDevices.filter((d) => d.status === "Asignado").length;
  const availableDevices = mockDevices.filter((d) => d.status === "Disponible").length;

  const sectorData = Object.entries(
    mockCompanies.reduce<Record<string, number>>((acc, company) => {
      acc[company.sector] = (acc[company.sector] || 0) + 1;
      return acc;
    }, {})
  ).map(([sector, count]) => ({ sector, count }));

  const growthData = [
    { month: "Oct", users: 420 },
    { month: "Nov", users: 485 },
    { month: "Dic", users: 560 },
    { month: "Ene", users: 680 },
    { month: "Feb", users: 890 },
    { month: "Mar", users: 1019 },
  ];

  const deviceStatusData = [
    { name: "Asignado", value: mockDevices.filter((d) => d.status === "Asignado").length },
    { name: "Disponible", value: mockDevices.filter((d) => d.status === "Disponible").length },
    { name: "Mantenimiento", value: mockDevices.filter((d) => d.status === "Mantenimiento").length },
    { name: "Inactivo", value: mockDevices.filter((d) => d.status === "Inactivo").length },
  ].filter((item) => item.value > 0);

  const recentActivity = [
    { type: "success", title: "Nueva empresa registrada", detail: "TechSolutions Ltda.", time: "Hace 2 horas" },
    { type: "info", title: "Dispositivo asignado", detail: "PB-003004 a Laura Martínez", time: "Hace 5 horas" },
    { type: "warning", title: "Usuario actualizado", detail: "Carlos Gómez cambió de área", time: "Hace 1 día" },
    { type: "error", title: "Empresa suspendida", detail: "Café de Colombia Export", time: "Hace 2 días" },
    { type: "info", title: "15 nuevos usuarios registrados", detail: "Grupo Nutresa", time: "Hace 3 días" },
  ];

  const topCompanies = mockCompanies
    .filter((c) => c.status === "Activa")
    .sort((a, b) => b.employeeCount - a.employeeCount)
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Panel de Control</h1>
        <p className="text-sm text-gray-500 mt-1">Vista general del sistema de gestión</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Empresas Activas"
          value={activeCompanies}
          change={{ value: "+12% vs mes anterior", trend: "up" }}
          icon={Building2}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Total Usuarios"
          value={totalUsers.toLocaleString()}
          change={{ value: "+8% vs mes anterior", trend: "up" }}
          icon={Users}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Dispositivos Activos"
          value={assignedDevices}
          change={{ value: `${availableDevices} disponibles`, trend: "neutral" }}
          icon={Watch}
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Nuevos Registros"
          value="24"
          change={{ value: "Este mes", trend: "up" }}
          icon={Activity}
          iconColor="text-orange-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Crecimiento de Usuarios</CardTitle>
              <Badge variant="secondary" className="text-xs">Últimos 6 meses</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#1e3a8a" strokeWidth={3} dot={{ fill: "#1e3a8a", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-semibold">Estado de Dispositivos</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={deviceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {deviceStatusData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {deviceStatusData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-semibold">Empresas por Sector</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="sector" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-semibold">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      activity.type === "success" ? "bg-green-500" :
                      activity.type === "info" ? "bg-blue-500" :
                      activity.type === "warning" ? "bg-orange-500" :
                      "bg-red-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.detail}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Companies */}
      <Card>
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Principales Empresas</CardTitle>
            <a href="/companies" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Ver todas
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleados</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispositivos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{company.name}</div>
                      <div className="text-xs text-gray-500">{company.nit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.sector}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.employeeCount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.devicesAssigned}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={company.status === "Activa" ? "default" : "secondary"} className="text-xs">
                        {company.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
