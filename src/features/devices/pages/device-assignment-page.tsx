import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, Watch, Wrench, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { mockDevices } from "@/data/mock-data";

export function DeviceAssignmentPage() {
  const navigate = useNavigate();
  const [deviceSearch, setDeviceSearch] = useState("");

  const availableDevices = mockDevices.filter(
    (d) => d.status === "Disponible" && d.id.toLowerCase().includes(deviceSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Dispositivo asignado exitosamente", {
      description: "El PostureBand ha sido vinculado al usuario.",
    });
    navigate(-1);
  };

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deviceId">ID del Dispositivo *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione dispositivo" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockDevices
                            .filter((d) => d.status === "Disponible")
                            .map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.id}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firmwareVersion">Versión de Firmware</Label>
                      <Input id="firmwareVersion" placeholder="v2.1.3" readOnly className="bg-gray-50" />
                    </div>
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
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">TechCorp Solutions S.A.S</SelectItem>
                          <SelectItem value="2">Grupo Industrial Andino</SelectItem>
                          <SelectItem value="3">Clínica Santa María del Rosario</SelectItem>
                          <SelectItem value="4">Constructora Horizonte S.A.</SelectItem>
                          <SelectItem value="5">BancoSeguro Colombia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user">Usuario *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione usuario" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="U001">Juan Pérez Rodríguez</SelectItem>
                          <SelectItem value="U002">María García López</SelectItem>
                          <SelectItem value="U003">Carlos Hernández Ruiz</SelectItem>
                          <SelectItem value="U004">Laura Martínez Cruz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-base font-semibold">Configuración de Asignación</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignmentDate">Fecha de Asignación *</Label>
                      <Input id="assignmentDate" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monitoringMode">Modo de Monitoreo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione modo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="continuous">Continuo</SelectItem>
                          <SelectItem value="scheduled">Programado</SelectItem>
                          <SelectItem value="on-demand">Bajo demanda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alertLevel">Nivel de Alerta</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Bajo</SelectItem>
                          <SelectItem value="medium">Medio</SelectItem>
                          <SelectItem value="high">Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="syncInterval">Intervalo de Sincronización</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione intervalo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Cada 5 minutos</SelectItem>
                          <SelectItem value="15">Cada 15 minutos</SelectItem>
                          <SelectItem value="30">Cada 30 minutos</SelectItem>
                          <SelectItem value="60">Cada hora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="notes">Notas de Asignación</Label>
                      <Textarea id="notes" placeholder="Observaciones sobre la asignación del dispositivo..." rows={3} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
                <Button type="submit" className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                  <Save className="w-4 h-4 mr-2" />
                  Asignar Dispositivo
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
                  {availableDevices.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No hay dispositivos disponibles</p>
                  ) : (
                    availableDevices.map((device) => (
                      <div key={device.id} className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{device.id}</span>
                          <Badge variant="default" className="text-[10px]">{device.status}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Firmware: v2.1.3</p>
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
