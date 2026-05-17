"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Package, ShoppingCart } from "lucide-react";

export default function SellerSidebar() {
  const { user } = useAuth();
  const pathname = usePathname(); // Nos dice en qué URL estamos
  const [nombreTienda, setNombreTienda] = useState("Cargando...");

  useEffect(() => {
    if (user?.id_usuario) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/tiendas/usuario/${user.id_usuario}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setNombreTienda(data[0].nombre_comercial);
          } else {
            setNombreTienda("Mi Tienda Patu");
          }
        })
        .catch(() => setNombreTienda("Mi Tienda"));
    }
  }, [user]);

  // Lista de enlaces para generarlos dinámicamente
  const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Resumen" },
    { href: "/dashboard/productos", icon: Package, label: "Mis Productos" },
    { href: "/dashboard/pedidos", icon: ShoppingCart, label: "Pedidos" },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-patu-600 rounded-xl flex items-center justify-center text-white font-black shadow-md">
          {nombreTienda.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-bold text-gray-900 leading-tight line-clamp-1">{nombreTienda}</h2>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Patu Seller</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          // Lógica para saber si el botón está activo:
          // Si es "/dashboard" exacto, o si la URL empieza con el href (ej: /dashboard/productos/nuevo)
          const isActive = link.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname.startsWith(link.href);

          return (
            <Link 
              key={link.href}
              href={link.href} 
              className={`flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all ${
                isActive 
                  ? "bg-patu-50 text-patu-600 font-bold" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" /> {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}