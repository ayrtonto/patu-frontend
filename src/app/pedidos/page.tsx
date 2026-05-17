"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { Wallet, Box, Truck, Star, Package as PackageIcon, Loader2 } from "lucide-react";
import Link from "next/link";

// Definimos las interfaces basadas en lo que devuelve Prisma desde NestJS
interface Producto {
  nombre: string;
  imagen_principal_url: string;
}

interface DetallePedido {
  cantidad: number;
  precio_unitario_momento: string;
  productos: Producto;
}

interface Pedido {
  id_pedido: number;
  total_final: string;
  estado_pedido: string;
  codigo_seguimiento: string | null;
  fecha_pedido: string;
  detalle_pedidos: DetallePedido[];
}

export default function PedidosPage() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no hay usuario aún, no hacemos la petición
    if (!user?.id_usuario) return;

    const fetchPedidos = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/usuario/${user.id_usuario}`);
        if (!response.ok) throw new Error("Error al obtener pedidos");
        const data = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [user]);

  // Contadores para el resumen superior
  const countEstado = (estado: string) => pedidos.filter(p => p.estado_pedido === estado).length;
  const procesando = countEstado("PROCESANDO_PAGO");
  const pendiente = countEstado("PENDIENTE_ENVIO");
  const enViaje = countEstado("EN_VIAJE");
  const entregado = countEstado("ENTREGADO");

  // Helper para traducir el estado del backend a un diseño visual
  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'ENTREGADO':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Entregado</span>;
      case 'EN_VIAJE':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">En Tránsito</span>;
      case 'PENDIENTE_ENVIO':
        return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-md">Preparando</span>;
      case 'PROCESANDO_PAGO':
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">Procesando Pago</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">{estado}</span>;
    }
  };

  // Helper para formatear la fecha
  const formatearFecha = (fechaString: string) => {
    const opciones: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  };

  if (!user) return null; // Evita renderizados fantasmas si el usuario no ha cargado

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-4 py-8">
      {/* Reutilizamos el Sidebar dinámico */}
      <ProfileSidebar />

      <div className="flex-1 space-y-6">
        
        {/* RESUMEN DE COMPRAS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Estado de mis compras</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-patu-50 hover:text-patu-600 transition-colors group relative">
              {procesando > 0 && <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{procesando}</div>}
              <Wallet className="w-8 h-8 text-gray-400 group-hover:text-patu-500 mb-2" />
              <span className="text-xs font-medium text-gray-700">Procesando</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-patu-50 hover:text-patu-600 transition-colors group relative">
              {pendiente > 0 && <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{pendiente}</div>}
              <Box className="w-8 h-8 text-gray-400 group-hover:text-patu-500 mb-2" />
              <span className="text-xs font-medium text-gray-700">Por enviar</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-patu-50 hover:text-patu-600 transition-colors group relative">
              {enViaje > 0 && <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{enViaje}</div>}
              <Truck className="w-8 h-8 text-gray-400 group-hover:text-patu-500 mb-2" />
              <span className="text-xs font-medium text-gray-700">En camino</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-patu-50 hover:text-patu-600 transition-colors group relative">
              {entregado > 0 && <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{entregado}</div>}
              <Star className="w-8 h-8 text-gray-400 group-hover:text-patu-500 mb-2" />
              <span className="text-xs font-medium text-gray-700">Completados</span>
            </button>
          </div>
        </div>

        {/* LISTADO DE PEDIDOS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900">Historial de Pedidos</h3>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-patu-500 animate-spin" />
              </div>
            ) : pedidos.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <PackageIcon className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
                <p>Aún no has realizado ninguna compra.</p>
              </div>
            ) : (
              pedidos.map((pedido) => (
                <div key={pedido.id_pedido} className="border border-gray-100 rounded-xl p-4 hover:border-patu-200 transition-colors">
                  
                  {/* Cabecera del pedido */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 mb-3 gap-2">
                    <div className="flex items-center gap-3">
                      {getBadgeEstado(pedido.estado_pedido)}
                      <span className="text-xs text-gray-500">{formatearFecha(pedido.fecha_pedido)}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500">Pedido #{String(pedido.id_pedido).padStart(6, '0')}</span>
                  </div>

                  {/* Detalle de productos dentro del pedido (Iteramos si compró más de una cosa) */}
                  {pedido.detalle_pedidos.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 py-2">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                        {item.productos.imagen_principal_url ? (
                          <img src={item.productos.imagen_principal_url} alt={item.productos.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <PackageIcon className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.productos.nombre}</h4>
                        <p className="text-xs text-gray-500 mt-1">Precio Unitario: S/ {item.precio_unitario_momento}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">Cant: {item.cantidad}</p>
                      </div>
                    </div>
                  ))}

                  {/* Pie del pedido con Total y Acciones */}
                  <div className="mt-4 pt-3 border-t border-gray-50 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Total del pedido (Incl. envío)</p>
                      <p className="font-bold text-lg text-patu-600">S/ {pedido.total_final}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {pedido.codigo_seguimiento && (
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          Tracking: {pedido.codigo_seguimiento}
                        </button>
                      )}
                      <Link 
                        href={`/pedidos/${pedido.id_pedido}`} className="px-4 py-2 text-sm font-medium text-white bg-patu-500 rounded-lg hover:bg-patu-600 transition-colors shadow-sm">
                        Ver detalle
                      </Link>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}