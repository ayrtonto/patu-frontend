"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, Package, ShoppingCart, Truck, 
  MapPin, Loader2, CheckCircle2, Clock, X
} from "lucide-react";

export default function GestionPedidosPage() {
  const { user } = useAuth();
  
  const [nombreTienda, setNombreTienda] = useState("Cargando...");
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA EL MODAL DE SEGUIMIENTO ---
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<number | null>(null);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");
  const [actualizando, setActualizando] = useState(false);

  // 1. Cargar tienda y luego sus pedidos
  const fetchDatos = async () => {
    if (!user?.id_usuario) return;
    try {
      const resTienda = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tiendas/usuario/${user.id_usuario}`);
      const tiendas = await resTienda.json();
      
      if (tiendas.length > 0) {
        setNombreTienda(tiendas[0].nombre_comercial);
        
        const resPedidos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/tienda/${tiendas[0].id_tienda}`);
        if (resPedidos.ok) {
          const data = await resPedidos.json();
          setPedidos(data);
        }
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, [user]);

  // 2. Lógica para cambiar el estado
  const handleEstadoChange = async (idPedido: number, nuevoEstado: string) => {
    // Si elige "EN_VIAJE", pausamos el update y abrimos el modal
    if (nuevoEstado === "EN_VIAJE") {
      setPedidoSeleccionado(idPedido);
      setModalOpen(true);
      return;
    }

    // Para cualquier otro estado, actualizamos directamente
    ejecutarActualizacion(idPedido, nuevoEstado);
  };

  // 3. Petición PATCH a tu API
  const ejecutarActualizacion = async (idPedido: number, estado: string, codigo?: string) => {
    setActualizando(true);
    try {
      const payload = { estado, ...(codigo ? { codigo_seguimiento: codigo } : {}) };

      const res = await fetch(`http://localhost:3000/pedidos/${idPedido}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al actualizar el estado");

      // Refrescamos la lista para ver los cambios
      await fetchDatos();
      setModalOpen(false);
      setCodigoSeguimiento("");
    } catch (error) {
      alert("No se pudo actualizar el estado.");
    } finally {
      setActualizando(false);
    }
  };

  const confirmarEnvio = () => {
    if (!codigoSeguimiento.trim()) return alert("Ingresa un código de seguimiento válido.");
    if (pedidoSeleccionado) {
      ejecutarActualizacion(pedidoSeleccionado, "EN_VIAJE", codigoSeguimiento);
    }
  };

  return (
    <div className="p-4 md:p-8">
      
      
      {/* CONTENIDO PRINCIPAL */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Gestión de Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">Actualiza el estado de tus ventas para notificar a los clientes.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-patu-500" /></div>
        ) : (
          <div className="space-y-6">
            {pedidos.map((pedido) => (
              <div key={pedido.id_pedido} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col xl:flex-row gap-6 justify-between">
                
                {/* Info del Cliente y Pedido */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Pedido #{pedido.id_pedido.toString().padStart(6, '0')}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(pedido.fecha_pedido).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Comprador</h4>
                      <p className="font-bold text-gray-900">{pedido.usuarios.nombres} {pedido.usuarios.apellidos}</p>
                      <p className="text-sm text-gray-500">{pedido.usuarios.telefono || 'Sin teléfono'}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><MapPin className="w-3 h-3"/> Envío a:</h4>
                      <p className="text-sm font-medium text-gray-900">{pedido.direcciones.direccion}</p>
                      <p className="text-xs text-gray-500">{pedido.direcciones.distrito}, {pedido.direcciones.referencia}</p>
                    </div>
                  </div>

                  {/* Resumen de Productos de esta Tienda */}
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Artículos a preparar:</h4>
                    <div className="space-y-2">
                      {pedido.detalle_pedidos.map((item: any) => (
                        <div key={item.id_detalle} className="flex items-center gap-3">
                          <img src={item.productos.imagen_principal_url} className="w-8 h-8 rounded-md object-cover border border-gray-100" alt="Prod" />
                          <p className="text-sm font-semibold text-gray-900 flex-1">{item.productos.nombre}</p>
                          <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                            Cant: {item.cantidad}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acciones y Estado */}
                <div className="w-full xl:w-72 bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Total a recibir</p>
                    {/* Monto de productos de la tienda descontando 5% comisión */}
                    <p className="text-3xl font-black text-patu-600 mb-6">
                      S/ {(Number(pedido.monto_productos) * 0.95).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Estado del Pedido:</label>
                    <select 
                      value={pedido.estado_pedido}
                      onChange={(e) => handleEstadoChange(pedido.id_pedido, e.target.value)}
                      className={`w-full font-bold text-sm px-4 py-3 rounded-xl outline-none appearance-none cursor-pointer border-2 transition-all ${
                        pedido.estado_pedido === 'ENTREGADO' ? 'bg-green-100 text-green-700 border-green-200' :
                        pedido.estado_pedido === 'EN_VIAJE' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        pedido.estado_pedido === 'PENDIENTE_ENVIO' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      <option value="PROCESANDO_PAGO" disabled>⏳ Procesando Pago</option>
                      <option value="PENDIENTE_ENVIO">📦 Pendiente de Envío</option>
                      <option value="EN_VIAJE">🚚 En Viaje (Añadir Tracking)</option>
                      <option value="ENTREGADO">✅ Entregado</option>
                    </select>

                    {pedido.codigo_seguimiento && (
                      <p className="mt-3 text-xs font-bold text-blue-600 flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Tracking: {pedido.codigo_seguimiento}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            ))}
            
            {pedidos.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900">No hay pedidos recientes</h3>
                <p className="text-gray-500">Tus ventas aparecerán aquí.</p>
              </div>
            )}
          </div>
        )}

      {/* MODAL DE CÓDIGO DE SEGUIMIENTO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => { setModalOpen(false); setCodigoSeguimiento(""); }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 p-2 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            
            <h2 className="text-xl font-black text-gray-900 mb-2">Pedido en Camino</h2>
            <p className="text-sm text-gray-500 mb-6">
              Por favor, ingresa el código de seguimiento (Olva, Shalom, etc.) para que el cliente pueda rastrear su paquete.
            </p>

            <input 
              type="text" 
              placeholder="Ej: OLVA-123456789"
              value={codigoSeguimiento}
              onChange={(e) => setCodigoSeguimiento(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-patu-500 focus:ring-1 focus:ring-patu-500 font-bold text-gray-900 mb-6 uppercase"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarEnvio}
                disabled={actualizando || !codigoSeguimiento}
                className="flex-1 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {actualizando && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar Envío
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}