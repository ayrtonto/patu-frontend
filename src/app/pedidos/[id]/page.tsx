"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Package, Truck, CheckCircle2, Clock, MapPin, 
  ChevronLeft, ExternalLink, ShieldCheck, Store, Loader2 
} from "lucide-react";
import Link from "next/link";

// --- INTERFACES BASADAS EN TU SERVICIO DE NESTJS ---
interface DetalleItem {
  id_detalle: number;
  cantidad: number;
  precio_unitario_momento: string;
  productos: {
    nombre: string;
    imagen_principal_url: string;
  };
  variantes_producto?: {
    variante_definicion: Array<{
      valores_atributos: {
        valor: string;
        atributos: { nombre: string };
      };
    }>;
  };
}

interface Pedido {
  id_pedido: number;
  public_id: string;
  estado_pedido: string;
  monto_productos: string;
  monto_envio: string;
  total_final: string;
  fecha_pedido: string;
  codigo_seguimiento?: string;
  direcciones: {
    nombre_direccion: string;
    direccion: string;
    distrito: string;
    referencia: string;
  };
  detalle_pedidos: DetalleItem[];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        // Nota: Asegúrate de tener un GET /pedidos/:id en tu backend que incluya las relaciones
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/${id}`);
        if (!res.ok) throw new Error("Pedido no encontrado");
        const data = await res.json();
        setPedido(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPedido();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-patu-500 animate-spin" />
    </div>
  );

  if (!pedido) return <div className="text-center py-20">Pedido no encontrado.</div>;

  // Lógica para el Stepper (Progreso)
  const estados = ["PROCESANDO_PAGO", "PENDIENTE_ENVIO", "EN_VIAJE", "ENTREGADO"];
  const indiceActual = estados.indexOf(pedido.estado_pedido);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* CABECERA */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-patu-600 font-bold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Volver a mis compras
        </button>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Pedido #{pedido.id_pedido.toString().padStart(6, '0')}</p>
          <p className="text-sm text-gray-500">{new Date(pedido.fecha_pedido).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* ESTADO DEL PEDIDO (STEPPER) */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
          {/* Línea de fondo del stepper */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 hidden md:block"></div>
          
          {estados.map((estado, index) => {
            const completado = index <= indiceActual;
            const esUltimo = index === estados.length - 1;
            
            return (
              <div key={estado} className="relative z-10 flex flex-col items-center gap-3 bg-white px-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  completado ? 'bg-patu-500 text-white shadow-lg shadow-patu-500/30' : 'bg-gray-100 text-gray-400'
                }`}>
                  {estado === "PROCESANDO_PAGO" && <Clock className="w-6 h-6" />}
                  {estado === "PENDIENTE_ENVIO" && <Package className="w-6 h-6" />}
                  {estado === "EN_VIAJE" && <Truck className="w-6 h-6" />}
                  {estado === "ENTREGADO" && <CheckCircle2 className="w-6 h-6" />}
                </div>
                <p className={`text-[11px] font-black uppercase tracking-tighter text-center ${completado ? 'text-patu-600' : 'text-gray-400'}`}>
                  {estado.replace(/_/g, " ")}
                </p>
              </div>
            );
          })}
        </div>
        
        {pedido.codigo_seguimiento && (
          <div className="mt-8 p-4 bg-patu-50 rounded-2xl border border-patu-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-patu-600" />
              <div>
                <p className="text-xs text-patu-700 font-bold">Código de Seguimiento:</p>
                <p className="text-sm font-black text-gray-900">{pedido.codigo_seguimiento}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-xs font-bold text-patu-600 hover:underline">
              Rastrear paquete <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: PRODUCTOS Y ENVÍO */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* LISTA DE PRODUCTOS */}
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Productos en este pedido</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {pedido.detalle_pedidos.map((item) => (
                <div key={item.id_detalle} className="p-6 flex gap-4">
                  <div className="w-20 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={item.productos.imagen_principal_url} alt={item.productos.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 py-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 text-sm md:text-base">{item.productos.nombre}</h4>
                      <p className="font-black text-patu-600">S/ {(Number(item.precio_unitario_momento) * item.cantidad).toFixed(2)}</p>
                    </div>
                    {/* Atributos dinámicos (Negro / M) */}
                    <p className="text-[11px] font-bold text-gray-400 uppercase mt-1">
                      {item.variantes_producto?.variante_definicion.map(d => d.valores_atributos.valor).join(" / ") || "Única"}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-500">Cantidad: <span className="font-bold text-gray-900">{item.cantidad}</span></span>
                      <span className="text-[11px] text-gray-400">P. Unit: S/ {Number(item.precio_unitario_momento).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIRECCIÓN DE ENVÍO */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-gray-900">Dirección de Entrega</h3>
            </div>
            <div className="ml-8">
              <p className="font-bold text-gray-900 text-sm">{pedido.direcciones.nombre_direccion}</p>
              <p className="text-sm text-gray-500 mt-1">{pedido.direcciones.direccion}</p>
              <p className="text-xs text-gray-400">{pedido.direcciones.distrito}, Lima</p>
              <p className="text-xs text-gray-400 italic mt-2">Ref: {pedido.direcciones.referencia}</p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN DE PAGO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg text-gray-900 mb-6">Resumen de Pago</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm text-gray-500 font-medium">
                <span>Subtotal productos</span>
                <span>S/ {Number(pedido.monto_productos).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 font-medium">
                <span>Costo de envío</span>
                <span className="text-green-600 font-bold">S/ {Number(pedido.monto_envio).toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                <span className="font-bold text-gray-900 uppercase text-xs tracking-wider">Total Final</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-patu-600 leading-none">S/ {Number(pedido.total_final).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <ShieldCheck className="w-4 h-4 text-patu-600" /> Pago Confirmado
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Tu transacción está protegida por Patu. El vendedor recibirá el pago una vez que confirmes la recepción.
              </p>
            </div>

            <button className="w-full mt-6 py-3 border-2 border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
              Descargar Comprobante
            </button>
          </div>

          <div className="bg-patu-50 rounded-2xl p-6 border border-patu-100">
            <div className="flex items-center gap-3 mb-2">
              <Store className="w-5 h-5 text-patu-600" />
              <h4 className="font-bold text-sm text-patu-700">Soporte Patu</h4>
            </div>
            <p className="text-[11px] text-patu-600 mb-4 font-medium">¿Tienes algún problema con tu pedido? Estamos para ayudarte.</p>
            <button className="w-full py-2 bg-white text-patu-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-patu-200">
              Contactar Ayuda
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}