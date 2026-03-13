import { useNavigate } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";

export function UserRegisterPage() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Usuario registrado exitosamente", { description: "El usuario ha sido creado en el sistema." });
    navigate("/users");
  };

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
                  <Input id="firstName" placeholder="Ingrese los nombres" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos *</Label>
                  <Input id="lastName" placeholder="Ingrese los apellidos" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentType">Tipo de Documento *</Label>
                  <Select required>
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
                  <Input id="document" placeholder="Ingrese el número" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input id="birthDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="employeeId">ID Empleado</Label>
                  <Input id="employeeId" placeholder="Código interno" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo *</Label>
                  <Input id="position" placeholder="Ingrese el cargo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Área / Departamento *</Label>
                  <Input id="area" placeholder="Ingrese el área" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Ingreso</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift">Turno / Jornada</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diurna">Diurna</SelectItem>
                      <SelectItem value="nocturna">Nocturna</SelectItem>
                      <SelectItem value="mixta">Mixta</SelectItem>
                      <SelectItem value="rotativa">Rotativa</SelectItem>
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
                  <Input id="email" type="email" placeholder="correo@empresa.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono / Celular</Label>
                  <Input id="phone" placeholder="+57" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" placeholder="Dirección completa" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold">Información Médica (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eps">EPS</Label>
                  <Input id="eps" placeholder="Entidad prestadora de salud" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arl">ARL</Label>
                  <Input id="arl" placeholder="Administradora de riesgos laborales" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="medicalNotes">Condiciones Médicas Relevantes</Label>
                  <Textarea id="medicalNotes" placeholder="Información médica relevante para el uso del dispositivo..." rows={3} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pb-6">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" className="bg-[#1e3a8a] hover:bg-[#1e40af]">
              <Save className="w-4 h-4 mr-2" />
              Registrar Usuario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
