"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { 
  Search, Camera, Package, User as UserIcon, ShoppingCart, 
  Heart, LogOut, MapPin, Store, ShieldCheck
} from 'lucide-react';
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getIniciales = () => {
    if (!user) return "??";
    const primerNombre = user.nombres.charAt(0);
    const primerApellido = user.apellidos.charAt(0);
    return `${primerNombre}${primerApellido}`.toUpperCase();
  };

  if (!isMounted) return null;

  // Lógica para detectar si es vendedor
  const isSeller = user?.rol === "VENDEDOR" || user?.rol === "ADMIN";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 md:gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-patu-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-xl">P</span>
              </div>
              <span className="font-black text-2xl text-patu-600 tracking-tight hidden lg:block">Patu</span>
            </Link>
          </div>

          {/* Buscador Central */}
          <div className="flex-1 max-w-2xl relative">
            <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-2.5 gap-3 border border-transparent focus-within:border-patu-300 focus-within:bg-white focus-within:shadow-md transition-all">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar en Gamarra Digital..." 
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 w-full"
              />
              <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
                <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <Camera className="w-5 h-5 text-patu-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Acciones Derecha */}
          <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
            
            {!isLoggedIn ? (
              // ESTADO: INVITADO
              <div className="relative group">
                <Link href="/login" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <UserIcon className="w-7 h-7 text-gray-700" />
                  <div className="hidden md:block text-left leading-none">
                    <p className="text-[10px] text-gray-500 font-bold mb-1">¡Bienvenido!</p>
                    <p className="text-sm font-bold text-gray-800">Inicia sesión</p>
                  </div>
                </Link>

                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-5 flex flex-col gap-3 items-center border-b border-gray-50">
                    <Link href="/login" className="w-full py-3 bg-gray-900 text-white text-center font-bold rounded-xl text-sm hover:bg-black transition-colors shadow-md">
                      Identifícate
                    </Link>
                    <Link href="/registro" className="text-xs text-patu-600 hover:text-patu-700 font-bold transition-colors">
                      ¿Eres nuevo? Regístrate aquí
                    </Link>
                  </div>
                  <div className="py-2">
                    <Link href="/login" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-patu-600 transition-colors">
                      <Package className="w-4 h-4" /> Mis Pedidos
                    </Link>
                    <Link href="/vendedores" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-patu-600 transition-colors">
                      <Store className="w-4 h-4" /> Vende con nosotros
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              // ESTADO: LOGUEADO
              <div className="relative group">
                <Link href="/perfil" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {getIniciales()}
                  </div>
                  <div className="hidden md:block text-left leading-none">
                    <p className="text-[10px] text-gray-500 font-bold mb-1">Mi Cuenta</p>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1 max-w-[100px]">{user?.nombres}</p>
                  </div>
                </Link>

                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                  
                  {/* Menú del Cliente */}
                  <div className="py-2">
                    <Link href="/perfil/personal" className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-patu-600 transition-colors">
                      <UserIcon className="w-4 h-4" /> Información Personal
                    </Link>
                    <Link href="/pedidos" className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-patu-600 transition-colors">
                      <Package className="w-4 h-4" /> Mis Pedidos
                    </Link>
                    <Link href="/favoritos" className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-patu-600 transition-colors">
                      <Heart className="w-4 h-4" /> Favoritos
                    </Link>
                    <Link href="/perfil/direcciones" className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-patu-600 transition-colors">
                      <MapPin className="w-4 h-4" /> Mis Direcciones
                    </Link>
                    <Link href="/perfil/seguridad" className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-patu-600 transition-colors">
                      <ShieldCheck className="w-4 h-4" /> Datos de la cuenta
                    </Link>
                  </div>

                  {/* Lógica del Botón Seller */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-b border-gray-100">
                    {isSeller ? (
                      <Link 
                        href="/dashboard" 
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-600/20"
                      >
                        <Store className="w-4 h-4" /> Mi Panel de Venta
                      </Link>
                    ) : (
                      <Link 
                        href="/vendedores" 
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-600/20"
                      >
                        <Store className="w-4 h-4" /> Vende con nosotros
                      </Link>
                    )}
                  </div>

                  <div className="py-1">
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-sm font-bold text-red-500 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <Link href="/carrito" className="p-2 hover:bg-gray-100 rounded-xl relative group transition-colors">
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-patu-600 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-patu-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}