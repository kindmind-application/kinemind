import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { User, Company } from "@/data/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyId: "",
    companyName: "",
    position: "",
    area: "",
    status: "Activo",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, companiesData] = await Promise.all([
        api.getUsers(),
        api.getCompanies()
      ]);
      setUsers(usersData);
      setCompanies(companiesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        companyName: user.companyName,
        position: user.position || "",
        area: user.area || "",
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        companyId: "",
        companyName: "",
        position: "",
        area: "",
        status: "Activo",
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este usuario?")) return;
    try {
      await api.deleteUser(id);
      toast.success("Usuario eliminado");
      await loadData();
    } catch (error) {
      toast.error("Error al eliminar usuario");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const company = companies.find(c => c.id === formData.companyId);
      const dataToSave = {
        ...formData,
        companyName: company?.name || "",
        role: formData.position || "Empleado", // Fallback for type
      };

      if (editingUser) {
        await api.updateUser(editingUser.id, dataToSave as any);
        toast.success("Usuario actualizado");
      } else {
        await api.addUser({
          ...dataToSave,
          deviceAssigned: null,
          lastActive: new Date().toISOString(),
        } as any);
        toast.success("Usuario creado");
      }
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      toast.error("Error al guardar usuario");
    }
  };

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#f7f9fb] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#00152a]">Gestión de Usuarios</h1>
          <p className="text-sm text-[#43474d] mt-1">Administre los empleados y sus perfiles</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-[#00152a] to-[#102a43] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Añadir Usuario
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#eceef0] flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#74777e]" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o empresa..."
              className="w-full pl-9 pr-4 py-2 bg-[#f2f4f6] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#102a43] focus:outline-none transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#eceef0]">
                <th className="px-6 py-4 text-[0.75rem] font-semibold tracking-wider text-[#43474d] uppercase">Usuario</th>
                <th className="px-6 py-4 text-[0.75rem] font-semibold tracking-wider text-[#43474d] uppercase">Empresa</th>
                <th className="px-6 py-4 text-[0.75rem] font-semibold tracking-wider text-[#43474d] uppercase">Rol/Área</th>
                <th className="px-6 py-4 text-[0.75rem] font-semibold tracking-wider text-[#43474d] uppercase">Estado</th>
                <th className="px-6 py-4 text-[0.75rem] font-semibold tracking-wider text-[#43474d] uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0] bg-[#f7f9fb]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#43474d] text-sm">Cargando usuarios...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#43474d] text-sm">No se encontraron usuarios</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f2f4f6] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#d1e4ff] text-[#011d35] flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#191c1e]">{user.name}</div>
                          <div className="text-xs text-[#57657a]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#191c1e]">{user.companyName}</div>
                      <div className="text-xs text-[#57657a]">ID: {user.companyId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#191c1e]">{user.position}</div>
                      <div className="text-xs text-[#57657a]">{user.area}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'Activo' ? 'bg-[#85f8c4] text-[#005137]' : 
                        user.status === 'Inactivo' ? 'bg-[#ffdad6] text-[#93000a]' : 
                        'bg-[#e0e3e5] text-[#43474d]'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-1.5 text-[#515f74] hover:text-[#00152a] hover:bg-[#eceef0] rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-[#515f74] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuario" : "Añadir Usuario"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={formData.companyId} onValueChange={(v) => setFormData({...formData, companyId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input id="position" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Área</Label>
                <Input id="area" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
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
