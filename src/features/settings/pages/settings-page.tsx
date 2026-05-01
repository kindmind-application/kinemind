import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/AuthContext";
import { updateProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export function SettingsPage() {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await updateProfile({ displayName });
      toast.success("Perfil actualizado");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error al actualizar el perfil";
      toast.error(message);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setPasswordLoading(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      toast.success("Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error al cambiar la contraseña";
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Configuración"
        description="Gestión de tu perfil y seguridad"
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    value={user?.username ?? ""}
                    disabled
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="displayName">Nombre de visualización</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-[#1e3a8a] hover:bg-[#1e40af]"
                >
                  {profileLoading ? "Guardando..." : "Guardar cambios"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-[#1e3a8a] hover:bg-[#1e40af]"
                >
                  {passwordLoading ? "Guardando..." : "Cambiar contraseña"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
