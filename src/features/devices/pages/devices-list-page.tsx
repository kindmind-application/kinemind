import { useEffect, useState } from "react";
import { Plus, Search, Battery, BatteryLow, Wifi, WifiOff, MoreVertical, Edit, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Device, User } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function DevicesListPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const [formData, setFormData] = useState({
    userId: "unassigned",
    status: "Disponible",
    firmwareVersion: "1.0.0",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [devicesData, usersData] = await Promise.all([
        api.getDevices(),
        api.getUsers()
      ]);
      setDevices(devicesData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (device?: Device) => {
    if (device) {
      setEditingDevice(device);
      setFormData({
        userId: device.userId || "unassigned",
        status: device.status,
        firmwareVersion: device.firmwareVersion,
      });
    } else {
      setEditingDevice(null);
      setFormData({
        userId: "unassigned",
        status: "Disponible",
        firmwareVersion: "1.0.0",
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este dispositivo?")) return;
    try {
      await api.deleteDevice(id);
      toast.success("Dispositivo eliminado");
      await loadData();
    } catch (error) {
      toast.error("Error al eliminar dispositivo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedUser = users.find(u => u.id === formData.userId);
      const dataToSave = {
        ...formData,
        userId: formData.userId === "unassigned" ? null : formData.userId,
        userName: selectedUser ? selectedUser.name : null,
        companyId: selectedUser ? selectedUser.companyId : null,
      };

      if (editingDevice) {
        await api.updateDevice(editingDevice.id, dataToSave as any);
        toast.success("Dispositivo actualizado");
      } else {
        await api.addDevice({
          ...dataToSave,
          batteryLevel: 100,
          lastSync: null,
        } as any);
        toast.success("Dispositivo registrado");
      }
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      toast.error("Error al guardar dispositivo");
    }
  };

  const filteredDevices = devices.filter((d) => 
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.userName && d.userName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 bg-[#f7f9fb] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#00152a]">Gestión de Dispositivos</h1>
          <p className="text-sm text-[#43474d] mt-1">Monitoree y administre la flota de dispositivos PostureBand</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-[#00152a] to-[#102a43] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Registrar Dispositivo
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] flex items-center justify-between border border-[#eceef0]">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#74777e]" />
          <input
            type="text"
            placeholder="Buscar por ID de dispositivo o usuario..."
            className="w-full pl-9 pr-4 py-2 bg-[#f2f4f6] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#102a43] focus:outline-none transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-[#f7f9fb] text-[#43474d] border-[#eceef0]">
            Total: {devices.length}
          </Badge>
          <Badge variant="outline" className="bg-[#85f8c4]/20 text-[#005137] border-transparent">
            Activos: {devices.filter(d => d.status === 'Asignado').length}
          </Badge>
        </div>
      </div>

      {/* Grid Content Area */}
      {loading ? (
        <div className="text-center py-12 text-[#43474d] text-sm">Cargando dispositivos...</div>
      ) : filteredDevices.length === 0 ? (
        <div className="text-center py-12 text-[#43474d] text-sm bg-white rounded-xl shadow-sm border border-[#eceef0]">No se encontraron dispositivos</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDevices.map((device) => {
            const isAssigned = device.status === 'Asignado';
            const isAvailable = device.status === 'Disponible';
            const isMaintenance = device.status === 'Mantenimiento';

            return (
              <div 
                key={device.id} 
                className="bg-white rounded-2xl p-5 border border-[#eceef0] hover:border-[#b0c9e8] hover:shadow-[0_20px_40px_rgba(25,28,30,0.06)] transition-all group relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 rounded-xl bg-[#f2f4f6] text-[#102a43]">
                    <div className="w-6 h-6 border-2 border-current rounded-md flex items-center justify-center opacity-80">
                      <div className="w-2 h-2 bg-current rounded-full"></div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-[#74777e] hover:text-[#00152a] opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenModal(device)}>
                        <Edit className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(device.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[#00152a]">{device.id}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    {isAssigned ? <Wifi className="w-3.5 h-3.5 text-[#24a375]" /> : <WifiOff className="w-3.5 h-3.5 text-[#74777e]" />}
                    <span className="text-xs text-[#57657a]">
                      {device.lastSync ? `Sincronizado: ${device.lastSync.split(' ')[1]}` : 'Sin conexión'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#57657a]">Estado</span>
                    <span className={`px-2 py-0.5 rounded-md text-[0.65rem] font-bold uppercase tracking-wider ${
                      isAssigned ? 'bg-[#85f8c4] text-[#005137]' : 
                      isAvailable ? 'bg-[#d1e4ff] text-[#011d35]' : 
                      isMaintenance ? 'bg-[#ffdad6] text-[#93000a]' :
                      'bg-[#e0e3e5] text-[#43474d]'
                    }`}>
                      {device.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#57657a]">Batería</span>
                    <div className="flex items-center gap-1.5 text-[#191c1e] font-medium">
                      {isAssigned ? <Battery className="w-4 h-4 text-[#24a375]" /> : <BatteryLow className="w-4 h-4 text-[#ba1a1a]" />}
                      {isAssigned ? `${device.batteryLevel}%` : '--'}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#f2f4f6] mt-3">
                    <span className="text-xs text-[#74777e] block mb-1">Usuario Asignado</span>
                    {device.userName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#102a43] text-white flex items-center justify-center text-[0.65rem] font-bold">
                          {device.userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-[#191c1e] truncate">{device.userName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-[#57657a] italic">Sin asignar</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingDevice ? "Editar Dispositivo" : "Registrar Dispositivo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Usuario Asignado</Label>
              <Select value={formData.userId} onValueChange={(v) => setFormData({...formData, userId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.companyName})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Asignado">Asignado</SelectItem>
                  <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firmware">Versión Firmware</Label>
              <Input id="firmware" required value={formData.firmwareVersion} onChange={(e) => setFormData({...formData, firmwareVersion: e.target.value})} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#102a43] text-white hover:bg-[#1e3a8a]">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
