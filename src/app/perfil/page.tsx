"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
// Añadimos useRouter
import { useRouter } from "next/navigation";
import { User, Package, Shield, MapPin, CreditCard, Heart, LogOut, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter(); // Inicializamos el router

  const getIniciales = () => {
    if (!user) return "??";
    return `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();
  };

  // Creamos la función que limpia y redirige
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null;

  const menuOptions = [
    { title: "Información Personal", desc: "Nombre, documento y teléfono", icon: <User className="w-7 h-7 text-blue-600" />, bg: "bg-blue-50", hover: "hover:border-blue-300", href: "/perfil/personal" },
    { title: "Mis Pedidos", desc: "Rastrea, devuelve o compra de nuevo", icon: <Package className="w-7 h-7 text-patu-600" />, bg: "bg-patu-50", hover: "hover:border-patu-300", href: "/pedidos" },
    { title: "Datos de la Cuenta", desc: "Contraseña y seguridad", icon: <Shield className="w-7 h-7 text-indigo-600" />, bg: "bg-indigo-50", hover: "hover:border-indigo-300", href: "/perfil/cuenta" },
    { title: "Mis Direcciones", desc: "Gestiona tus lugares de entrega", icon: <MapPin className="w-7 h-7 text-orange-600" />, bg: "bg-orange-50", hover: "hover:border-orange-300", href: "/perfil/direcciones" },
    { title: "Métodos de Pago", desc: "Tarjetas y cuentas bancarias", icon: <CreditCard className="w-7 h-7 text-purple-600" />, bg: "bg-purple-50", hover: "hover:border-purple-300", href: "/perfil/pagos" },
    { title: "Mis Favoritos", desc: "Listas de deseos y guardados", icon: <Heart className="w-7 h-7 text-pink-600" />, bg: "bg-pink-50", hover: "hover:border-pink-300", href: "/perfil/favoritos" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5 shadow-sm mb-8 transition-all hover:shadow-md">
        <div className="w-20 h-20 bg-gradient-to-tr from-patu-400 to-patu-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-inner flex-shrink-0">
          {getIniciales()}
        </div>
        <div>
          <h1 className="font-bold text-2xl text-gray-900 mb-1">Hola, {user.nombres}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuOptions.map((option, index) => (
          <Link key={index} href={option.href} className={`flex items-center p-5 bg-white rounded-2xl border border-gray-100 ${option.hover} hover:shadow-md transition-all group cursor-pointer`}>
            <div className={`w-14 h-14 ${option.bg} rounded-xl flex items-center justify-center mr-5 transition-colors`}>{option.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 group-hover:text-gray-700 transition-colors text-lg">{option.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{option.desc}</p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-300 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        {/* Cambiamos el onClick para usar nuestra nueva función */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}