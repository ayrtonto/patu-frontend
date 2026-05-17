"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, Package, ShoppingCart, TrendingUp, 
  Wallet, Users, ArrowUpRight, ArrowDownRight, Store, 
  Bell, PlusCircle, Activity
} from "lucide-react";
import { ReactNode } from "react";
import SellerSidebar from "./layout";

// --- DATOS ESTÁTICOS PARA EL MVP ---
const MOCK_METRICS = {
  ventasTotales: 12450.00,
  pedidosMes: 142,
  clientesNuevos: 38,
  conversion: 3.2
};

const MOCK_CHART = [
  { dia: "Lun", ventas: 40 },
  { dia: "Mar", ventas: 70 },
  { dia: "Mié", ventas: 45 },
  { dia: "Jue", ventas: 90 },
  { dia: "Vie", ventas: 65 },
  { dia: "Sáb", ventas: 100 },
  { dia: "Dom", ventas: 85 },
];

const MOCK_ORDERS = [
  { id: "#000142", cliente: "Ana López", fecha: "Hoy, 10:24 AM", total: 125.00, estado: "Pendiente" },
  { id: "#000141", cliente: "Carlos Ruiz", fecha: "Hoy, 09:15 AM", total: 85.00, estado: "Enviado" },
  { id: "#000140", cliente: "María Torres", fecha: "Ayer, 16:40 PM", total: 210.00, estado: "Entregado" },
];

export default function DashboardLayout({ children }: { children: ReactNode }){
  const { user } = useAuth();
  const [nombreTienda, setNombreTienda] = useState("Cargando tienda...");

  // Obtenemos el nombre real de la tienda desde el backend que armamos hace un momento
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

  return (
    <div className="p-4 md:p-8">
        
        {/* HEADER MÓVIL Y ACCIONES */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">¡Hola, {user?.nombres || 'Vendedor'}! 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Aquí está el resumen de tu negocio en Gamarra Digital hoy.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-patu-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <Link 
              href="/dashboard/productos/nuevo" 
              className="px-5 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-full shadow-lg hover:bg-black transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Nuevo Producto
            </Link>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" /> +12.5%
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Ingresos (Mes)</p>
            <h3 className="text-2xl font-black text-gray-900">S/ {MOCK_METRICS.ventasTotales.toLocaleString('es-PE')}</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" /> +8.2%
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Pedidos Totales</p>
            <h3 className="text-2xl font-black text-gray-900">{MOCK_METRICS.pedidosMes}</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" /> +24.0%
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Nuevos Clientes</p>
            <h3 className="text-2xl font-black text-gray-900">{MOCK_METRICS.clientesNuevos}</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                <ArrowDownRight className="w-3 h-3" /> -1.2%
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Tasa de Conversión</p>
            <h3 className="text-2xl font-black text-gray-900">{MOCK_METRICS.conversion}%</h3>
          </div>
        </div>

        {/* GRAFICO Y TABLA INFERIOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MOCK CHART (CSS PURO) */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-900">Resumen de Ventas</h3>
              <select className="bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg px-3 py-1.5 outline-none">
                <option>Últimos 7 días</option>
                <option>Este mes</option>
              </select>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-2 h-48 relative">
              {/* Líneas horizontales de fondo */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-t border-gray-300 w-full"></div>
                <div className="border-t border-gray-300 w-full"></div>
                <div className="border-t border-gray-300 w-full"></div>
                <div className="border-t border-gray-300 w-full"></div>
              </div>

              {/* Barras dinámicas */}
              {MOCK_CHART.map((data, i) => (
                <div key={i} className="flex flex-col items-center flex-1 z-10 group">
                  <div className="w-full max-w-[40px] bg-patu-100 rounded-t-xl relative overflow-hidden h-full flex items-end justify-center group-hover:bg-patu-200 transition-colors">
                    <div 
                      className="w-full bg-gradient-to-t from-patu-600 to-patu-400 rounded-t-xl transition-all duration-1000"
                      style={{ height: `${data.ventas}%` }}
                    ></div>
                    {/* Tooltip Hover */}
                    <div className="absolute top-2 opacity-0 group-hover:opacity-100 text-[10px] font-black text-patu-900 transition-opacity">
                      {data.ventas}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-400 mt-3">{data.dia}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ÚLTIMOS PEDIDOS */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Últimos Pedidos</h3>
              <button className="text-xs font-bold text-patu-600 hover:underline">Ver todos</button>
            </div>

            <div className="space-y-4 flex-1">
              {MOCK_ORDERS.map((orden) => (
                <div key={orden.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{orden.cliente}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{orden.id} • {orden.fecha}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">S/ {orden.total.toFixed(2)}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      orden.estado === 'Pendiente' ? 'bg-orange-100 text-orange-600' :
                      orden.estado === 'Enviado' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {orden.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
    </div>
  );
}