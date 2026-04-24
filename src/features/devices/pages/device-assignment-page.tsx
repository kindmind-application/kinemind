import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Watch, Wrench, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { listDevices, assignDevice, devicesKeys } from "@/lib/api/devices";
import { listCompanies, companiesKeys } from "@/lib/api/companies";
import { listEmployees, employeesKeys } from "@/lib/api/employees";
import { ApiError } from "@/lib/api/client";

export function DeviceAssignmentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deviceSearch, setDeviceSearch] = useState("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>("");

  const availableDevicesQuery = useQuery({
    queryKey: devicesKeys.list({ status: "Disponible", pageSize: 100 }),
    queryFn: () => listDevices({ status: "Disponible", pageSize: 100 }),
  });

  const companiesQuery = useQuery({
    queryKey: companiesKeys.list({ pageSize: 100, sort: "name:asc" }),
    queryFn: () => listCompanies({ pageSize: 100, sort: "name:asc" }),
  });

  const employeesQuery = useQuery({
    queryKey: employeesKeys.list({ companyId: companyId || undefined, pageSize: 100 }),
    queryFn: () => listEmployees({ companyId: companyId || undefined, pageSize: 100 }),
    enabled: !!companyId,
  });

  const mutation = useMutation({
    mutationFn: (vars: { deviceId: string; employeeId: string }) =>
      assignDevice(vars.deviceId, vars.employeeId),
    onSuccess: () => {
      toast.success("Dispositivo asignado exitosamente");
      queryClient.invalidateQueries({ queryKey: devicesKeys.all });
      queryClient.invalidateQueries({ queryKey: employeesKeys.all });
      navigate("/devices");
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Error al asignar dispositivo";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId || !employeeId) {
      toast.error("Seleccione un dispositivo y un usuario");
      return;
    }
    mutation.mutate({ deviceId, employeeId });
  };

  const availableDevices = useMemo(() => {
    const all = availableDevicesQuery.data?.items ?? [];
    const q = deviceSearch.toLowerCase();
    return q ? all.filter((d) => d.id.toLowerCase().includes(q)) : all;
  }, [availableDevicesQuery.data, deviceSearch]);

  const companies = companiesQuery.data?.items ?? [];
  const employees = employeesQuery.data?.items ?? [];

  return (
    <div className="bg-gray-50 min-h-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <PageHeader
            title="Asignar Dispositivo PostureBand"
            description="Vincule un dispositivo PostureBand a un usuario registrado en el sistema."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Selección de Dispositivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="deviceId">ID del Dispositivo *</Label>
                    <Select value={deviceId} onValueChange={setDeviceId} required>
                      <SelectTrigger>
                        <SelectValue placeholder={availableDevicesQuery.isLoading ? "Cargando..." : "Seleccione dispositivo"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDevices.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-base font-semibold">Usuario Destino</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa *</Label>
                      <Select value={companyId} onValueChange={(v) => { setCompanyId(v); setEmployeeId(""); }} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user">Usuario *</Label>
                      <Select value={employeeId} onValueChange={setEmployeeId} disabled={!companyId} required>
                        <SelectTrigger>
                          <SelectValue placeholder={!companyId ? "Primero elige una empresa" : employeesQuery.isLoading ? "Cargando..." : "Seleccione usuario"} />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
                <Button type="submit" className="bg-[#1e3a8a] hover:bg-[#1e40af]" disabled={mutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {mutation.isPending ? "Asignando..." : "Asignar Dispositivo"}
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Watch className="w-4 h-4" />
                  Dispositivos Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={deviceSearch}
                    onChange={(e) => setDeviceSearch(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableDevicesQuery.isLoading ? (
                    <p className="text-xs text-gray-500 text-center py-4">Cargando...</p>
                  ) : availableDevices.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No hay dispositivos disponibles</p>
                  ) : (
                    availableDevices.map((device) => (
                      <div
                        key={device.id}
                        onClick={() => setDeviceId(device.id)}
                        className={`p-2.5 border rounded-lg cursor-pointer transition-colors ${
                          deviceId === device.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{device.id}</span>
                          <Badge variant="default" className="text-[10px]">{device.status}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
