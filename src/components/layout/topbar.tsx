import { Search, Bell, ChevronDown, Building2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth, useRole } from "@/lib/auth/AuthContext";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Topbar() {
  const { user } = useAuth();
  const { isSuperAdmin, companyName } = useRole();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder={
                isSuperAdmin
                  ? "Buscar empresas, usuarios, dispositivos..."
                  : "Buscar usuarios y dispositivos..."
              }
              className="pl-10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Role / company badge */}
          {isSuperAdmin ? (
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 px-3 py-1.5 gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin
            </Badge>
          ) : companyName ? (
            <Badge
              className="bg-[#1e3a8a] text-white px-3 py-1.5 gap-1.5 hover:bg-[#1e40af]"
              data-testid="company-badge"
            >
              <Building2 className="w-3.5 h-3.5" />
              {companyName}
            </Badge>
          ) : null}

          <button
            type="button"
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              3
            </Badge>
          </button>

          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {initials(user?.displayName ?? user?.username ?? "AD")}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
