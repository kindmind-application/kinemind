import { Building2, Users, Watch, Activity, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { StatsCard } from "@/components/shared/stats-card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";
import {
  getStats, getSectors, getGrowth, getDeviceStatus, dashboardKeys,
} from "@/lib/api/dashboard";
import { listCompanies, companiesKeys } from "@/lib/api/companies";

const COLORS = ["#1e3a8a", "#3b82f6", "#60a5fa", "#93c5fd"];
const GROWTH_MONTHS = 12;

const MONTH_FORMATTER = new Intl.DateTimeFormat("es-CO", { month: "short" });

export function DashboardPage() {
  const statsQuery = useQuery({ queryKey: dashboardKeys.stats, queryFn: getStats });
  const sectorsQuery = useQuery({ queryKey: dashboardKeys.sectors, queryFn: getSectors });
  const growthQuery = useQuery({ queryKey: dashboardKeys.growth(GROWTH_MONTHS), queryFn: () => getGrowth(GROWTH_MONTHS) });
  const deviceStatusQuery = useQuery({ queryKey: dashboardKeys.deviceStatus, queryFn: getDeviceStatus });

  const topCompaniesQuery = useQuery({
    queryKey: companiesKeys.list({ status: "Activa", pageSize: 5, sort: "employee_count:desc" }),
    queryFn: () => listCompanies({ status: "Activa", pageSize: 5, sort: "employee_count:desc" }),
  });

  const stats = statsQuery.data;
  const activeCompanies = stats?.activeCompanies ?? 0;
  const totalUsers = stats?.totalEmployees ?? 0;
  const assignedDevices = stats?.assignedDevices ?? 0;
  const availableDevices = stats?.availableDevices ?? 0;

  const sectorData = sectorsQuery.data ?? [];

  const growthData = (growthQuery.data ?? []).map((p) => ({
    month: MONTH_FORMATTER.format(new Date(p.month)),
    users: p.employees,
  }));

  const deviceStatusData = (deviceStatusQuery.data ?? []).map((p) => ({
    name: p.status,
    value: p.count,
  }));

  const topCompanies = topCompaniesQuery.data?.items ?? [];

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
          icon={Building2}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Total Usuarios"
          value={totalUsers.toLocaleString()}
          icon={Users}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Dispositivos Asignados"
          value={assignedDevices}
          change={{ value: `${availableDevices} disponibles`, trend: "neutral" }}
          icon={Watch}
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Dispositivos Disponibles"
          value={availableDevices}
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
              <Badge variant="secondary" className="text-xs">Últimos {GROWTH_MONTHS} meses</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
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
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-semibold">Resumen Operativo</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Empresas activas</p>
                  <p className="text-xs text-gray-500 mt-0.5">{activeCompanies} clientes con servicio vigente</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Cobertura de dispositivos</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {totalUsers > 0 ? `${Math.round((assignedDevices / totalUsers) * 100)}% de empleados con PostureBand` : "Sin empleados registrados"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Stock disponible</p>
                  <p className="text-xs text-gray-500 mt-0.5">{availableDevices} dispositivos listos para asignar</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Total empleados</p>
                  <p className="text-xs text-gray-500 mt-0.5">{totalUsers.toLocaleString()} registrados en el sistema</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Companies */}
      <Card>
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Principales Empresas</CardTitle>
            <Link to="/companies" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Ver todas
              <ArrowUpRight className="w-4 h-4" />
            </Link>
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
                {topCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      {topCompaniesQuery.isLoading ? "Cargando..." : "Sin empresas activas"}
                    </td>
                  </tr>
                ) : topCompanies.map((company) => (
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
