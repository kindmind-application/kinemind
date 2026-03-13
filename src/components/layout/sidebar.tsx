import { Link, useLocation } from "react-router";
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
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

export function Sidebar() {
  const location = useLocation();

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
      <div className="p-4 border-t border-blue-700">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Admin Usuario</div>
            <div className="text-xs text-blue-200 truncate">admin@kinemind.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
