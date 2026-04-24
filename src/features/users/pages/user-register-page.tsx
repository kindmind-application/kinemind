import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { listCompanies, companiesKeys } from "@/lib/api/companies";
import { createEmployee, employeesKeys } from "@/lib/api/employees";
import { ApiError } from "@/lib/api/client";

export function UserRegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentType, setDocumentType] = useState("CC");
  const [documentNumber, setDocumentNumber] = useState("");
  const [companyId, setCompanyId] = useState<string>("");
  const [position, setPosition] = useState("");
  const [area, setArea] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"Activo" | "Inactivo" | "Pendiente">("Activo");

  const companiesQuery = useQuery({
    queryKey: companiesKeys.list({ pageSize: 100, sort: "name:asc" }),
    queryFn: () => listCompanies({ pageSize: 100, sort: "name:asc" }),
  });

  const mutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success("Usuario registrado exitosamente");
      queryClient.invalidateQueries({ queryKey: employeesKeys.all });
      navigate("/users");
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Error al registrar usuario";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      toast.error("Debe seleccionar una empresa");
      return;
    }
    mutation.mutate({
      companyId,
      name: `${firstName} ${lastName}`.trim(),
      document: documentNumber,
      position,
      area,
      email,
      phone,
      status,
      joinDate: new Date().toISOString().slice(0, 10),
    });
  };

  const companies = companiesQuery.data?.items ?? [];

  return (
    <div className="bg-gray-50 min-h-full p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <PageHeader title="Registrar Nuevo Usuario" description="Complete los datos del empleado para crear su perfil en el sistema." />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombres *</Label>
                  <Input id="firstName" placeholder="Ingrese los nombres" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos *</Label>
                  <Input id="lastName" placeholder="Ingrese los apellidos" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentType">Tipo de Documento *</Label>
                  <Select value={documentType} onValueChange={setDocumentType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      <SelectItem value="PP">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Número de Documento *</Label>
                  <Input id="document" placeholder="Ingrese el número" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold">Información Laboral</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa *</Label>
                  <Select value={companyId} onValueChange={setCompanyId} required>
                    <SelectTrigger>
                      <SelectValue placeholder={companiesQuery.isLoading ? "Cargando..." : "Seleccione empresa"} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo *</Label>
                  <Input id="position" placeholder="Ingrese el cargo" value={position} onChange={(e) => setPosition(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Área / Departamento *</Label>
                  <Input id="area" placeholder="Ingrese el área" value={area} onChange={(e) => setArea(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input id="email" type="email" placeholder="correo@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono / Celular *</Label>
                  <Input id="phone" placeholder="+57" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold">Notas adicionales (opcional)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="notes">Observaciones</Label>
                <Textarea id="notes" placeholder="Información adicional (no persistida en esta versión)" rows={3} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pb-6">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" className="bg-[#1e3a8a] hover:bg-[#1e40af]" disabled={mutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {mutation.isPending ? "Guardando..." : "Registrar Usuario"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
