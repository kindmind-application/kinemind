import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await login(username, password);
      toast.success("Sesión iniciada");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No fue posible iniciar sesión";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e3a8a] rounded-lg flex items-center justify-center">
              <Watch className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Kine Mind</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-10"
                placeholder="Ingrese su usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10"
                placeholder="Ingrese su contraseña"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] h-10"
            >
              {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
