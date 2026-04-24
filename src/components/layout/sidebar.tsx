import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  Watch,
  Package,
  Warehouse,
  Truck,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes y Empresas", href: "/companies", icon: Building2 },
  { name: "Usuarios", href: "/users", icon: Users },
  { name: "Dispositivos", href: "/devices", icon: Watch },
  { name: "Producción", href: "/production", icon: Package },
  { name: "Inventario", href: "/inventory", icon: Warehouse },
  { name: "Logística", href: "/logistics", icon: Truck },
  { name: "Ventas y Marketing", href: "/sales", icon: TrendingUp },
  { name: "Configuración", href: "/settings", icon: Settings },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="w-64 bg-[#1e3a8a] text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Watch className="w-5 h-5 text-[#1e3a8a]" />
          </div>
          <div>
            <div className="font-semibold text-lg">Kine Mind</div>
            <div className="text-xs text-blue-200">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/" && location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-blue-700 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-blue-600 text-white">
              {initials(user?.displayName ?? user?.username ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.displayName ?? "Usuario"}</div>
            <div className="text-xs text-blue-200 truncate">{user?.username ?? ""}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-blue-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
