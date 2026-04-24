import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, Building2, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompany, companiesKeys } from "@/lib/api/companies";
import { ApiError } from "@/lib/api/client";

export function CompanyRegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    nit: "",
    sector: "",
    size: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    contactName: "",
    contactPosition: "",
    contactEmail: "",
    contactPhone: "",
    status: "Activa" as "Activa" | "Inactiva" | "En negociación" | "Suspendida",
    observations: "",
  });

  const mutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      toast.success("Empresa registrada exitosamente");
      queryClient.invalidateQueries({ queryKey: companiesKeys.all });
      navigate("/companies");
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Error al registrar empresa";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name: formData.name,
      nit: formData.nit,
      sector: formData.sector,
      size: formData.size,
      city: formData.city,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      contactName: formData.contactName,
      contactPosition: formData.contactPosition,
      status: formData.status,
      observations: formData.observations,
      registrationDate: new Date().toISOString().slice(0, 10),
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }) as typeof prev);
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <PageHeader title="Registrar Nueva Empresa" description="Complete la información de la empresa cliente" />

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base font-semibold">Información de la Empresa</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre de la Empresa <span className="text-red-500">*</span></Label>
                  <Input id="name" placeholder="Ej: Grupo Empresarial S.A." value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nit" className="text-sm font-medium text-gray-700">NIT / Identificación <span className="text-red-500">*</span></Label>
                  <Input id="nit" placeholder="Ej: 890.903.938-8" value={formData.nit} onChange={(e) => handleChange("nit", e.target.value)} required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-sm font-medium text-gray-700">Sector Económico <span className="text-red-500">*</span></Label>
                  <Select value={formData.sector} onValueChange={(v) => handleChange("sector", v)}>
                    <SelectTrigger id="sector" className="h-10"><SelectValue placeholder="Seleccione un sector" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Financiero">Financiero</SelectItem>
                      <SelectItem value="Tecnología">Tecnología</SelectItem>
                      <SelectItem value="Salud">Salud</SelectItem>
                      <SelectItem value="Alimentos">Alimentos</SelectItem>
                      <SelectItem value="Construcción">Construcción</SelectItem>
                      <SelectItem value="Logística">Logística</SelectItem>
                      <SelectItem value="Agroindustria">Agroindustria</SelectItem>
                      <SelectItem value="Educación">Educación</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Manufactura">Manufactura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-sm font-medium text-gray-700">Tamaño de Empresa <span className="text-red-500">*</span></Label>
                  <Select value={formData.size} onValueChange={(v) => handleChange("size", v)}>
                    <SelectTrigger id="size" className="h-10"><SelectValue placeholder="Seleccione el tamaño" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pequeña">Pequeña (1-50 empleados)</SelectItem>
                      <SelectItem value="Mediana">Mediana (51-200 empleados)</SelectItem>
                      <SelectItem value="Grande">Grande (201+ empleados)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">Ciudad <span className="text-red-500">*</span></Label>
                  <Input id="city" placeholder="Ej: Medellín" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">Dirección <span className="text-red-500">*</span></Label>
                  <Input id="address" placeholder="Ej: Calle 50 #51-66" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Teléfono <span className="text-red-500">*</span></Label>
                  <Input id="phone" type="tel" placeholder="Ej: +57 4 5108000" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo Corporativo <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" placeholder="Ej: contacto@empresa.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required className="h-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base font-semibold">Contacto Principal</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">Nombre Completo <span className="text-red-500">*</span></Label>
                  <Input id="contactName" placeholder="Ej: María González" value={formData.contactName} onChange={(e) => handleChange("contactName", e.target.value)} required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPosition" className="text-sm font-medium text-gray-700">Cargo <span className="text-red-500">*</span></Label>
                  <Input id="contactPosition" placeholder="Ej: Gerente de RRHH" value={formData.contactPosition} onChange={(e) => handleChange("contactPosition", e.target.value)} required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></Label>
                  <Input id="contactEmail" type="email" placeholder="Ej: maria.gonzalez@empresa.com" value={formData.contactEmail} onChange={(e) => handleChange("contactEmail", e.target.value)} required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-sm font-medium text-gray-700">Teléfono <span className="text-red-500">*</span></Label>
                  <Input id="contactPhone" type="tel" placeholder="Ej: +57 300 1234567" value={formData.contactPhone} onChange={(e) => handleChange("contactPhone", e.target.value)} required className="h-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base font-semibold">Información Adicional</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">Estado del Cliente <span className="text-red-500">*</span></Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger id="status" className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activa">Activa</SelectItem>
                      <SelectItem value="Inactiva">Inactiva</SelectItem>
                      <SelectItem value="En negociación">En negociación</SelectItem>
                      <SelectItem value="Suspendida">Suspendida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observations" className="text-sm font-medium text-gray-700">Observaciones</Label>
                  <Textarea id="observations" placeholder="Notas adicionales sobre la empresa cliente..." value={formData.observations} onChange={(e) => handleChange("observations", e.target.value)} rows={4} className="resize-none" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end pt-4 pb-6">
            <Button type="button" variant="outline" onClick={() => navigate("/companies")} className="min-w-32">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#1e3a8a] hover:bg-[#1e40af] min-w-32" disabled={mutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {mutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
