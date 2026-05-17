"use client";

import Link from "next/link";
// Añadimos useRouter
import { usePathname, useRouter } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext";
import { User, Shield, Package, Heart, MapPin, CreditCard, LogOut } from "lucide-react";

export default function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter(); // Inicializamos el router
  const { user, logout } = useAuth();

  const getIniciales = () => {
    if (!user) return "??";
    const inicialNombre = user.nombres.charAt(0);
    const inicialApellido = user.apellidos.charAt(0);
    return `${inicialNombre}${inicialApellido}`.toUpperCase();
  };

  // Creamos la función que limpia y redirige
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const menuItems = [
    { name: "Información Personal", href: "/perfil/personal", icon: User },
    { name: "Datos de la Cuenta", href: "/perfil/cuenta", icon: Shield },
    { name: "Mis Pedidos", href: "/pedidos", icon: Package },
    { name: "Favoritos", href: "/perfil/favoritos", icon: Heart },
    { name: "Mis Direcciones", href: "/perfil/direcciones", icon: MapPin },
    { name: "Métodos de Pago", href: "/perfil/pagos", icon: CreditCard },
  ];

  if (!user) return null;

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
        
        <Link href="/perfil">
          <div className="p-6 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
            <div className="w-14 h-14 bg-gradient-to-tr from-patu-400 to-patu-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner flex-shrink-0">
              {getIniciales()}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-gray-900 truncate">
                {user.nombres} {user.apellidos}
              </h2>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </Link>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? "bg-patu-50 text-patu-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          
          <div className="border-t border-gray-100 my-2"></div>
          
          {/* Cambiamos el onClick para usar nuestra nueva función */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </nav>
      </div>
    </aside>
  );
}