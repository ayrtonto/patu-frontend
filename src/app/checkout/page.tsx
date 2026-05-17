"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { 
  MapPin, CreditCard, Wallet, CheckCircle2, 
  ChevronRight, Truck, ShieldCheck, Loader2 
} from "lucide-react";
import Link from "next/link";

interface Direccion {
  id_direccion: number;
  nombre_direccion: string;
  direccion: string;
  distrito: string;
  es_principal: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { cart, totalPrice, totalItems, clearCart, refreshCart } = useCart();

  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [idDireccionSeleccionada, setIdDireccionSeleccionada] = useState<number | null>(null);
  const [metodoPago, setMetodoPago] = useState<string>("tarjeta");
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // NUEVO ESTADO
  const [pedidoCompletado, setPedidoCompletado] = useState(false);

  // 1. Verificar sesión y carrito, y cargar direcciones
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // SOLO redirigir si NO se completó el pedido
    if (cart.length === 0 && !pedidoCompletado) {
      router.push("/carrito");
      return;
    }

    const fetchDirecciones = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/direcciones/usuario/${user?.id_usuario}`
        );

        if (res.ok) {
          const data: Direccion[] = await res.json();

          setDirecciones(data);

          const principal = data.find((d) => d.es_principal);

          if (principal) {
            setIdDireccionSeleccionada(principal.id_direccion);
          } else if (data.length > 0) {
            setIdDireccionSeleccionada(data[0].id_direccion);
          }
        }
      } catch (error) {
        console.error("Error al cargar direcciones", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDirecciones();
  }, [isLoggedIn, cart.length, user, router, pedidoCompletado]);

  // 2. Procesar el Pago
  const handleConfirmarPedido = async () => {
    if (!idDireccionSeleccionada) {
      return alert("Por favor, selecciona una dirección de envío.");
    }

    setProcesando(true);

    try {
      const payload = {
        id_usuario: user?.id_usuario,
        id_direccion: idDireccionSeleccionada,
        monto_envio: 0,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pedidos/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(
          errorData.message || "Error al procesar el pedido"
        );
      }

      const pedidoCreado = await res.json();

      console.log(
        "Pedido confirmado con éxito:",
        pedidoCreado
      );

      // IMPORTANTE
      setPedidoCompletado(true);

      // Vaciar carrito en frontend
      await refreshCart();

      // Alert
      alert("¡Pedido realizado con éxito!");

      // Redirigir
      router.push("/pedidos");

    } catch (error: any) {
      console.error("Error en checkout:", error);

      alert(
        `No se pudo completar la compra: ${error.message}`
      );
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-patu-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Preparando tu compra...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb del Checkout */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
        <Link href="/carrito" className="hover:text-patu-600 transition-colors">Carrito</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-bold">Pago y Envío</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        
        {/* COLUMNA IZQUIERDA (Formularios) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECCIÓN 1: DIRECCIÓN DE ENVÍO */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">1</div>
              <h2 className="text-xl font-bold text-gray-900">Dirección de Envío</h2>
            </div>
            
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              {direcciones.length === 0 ? (
                <div className="text-center py-6">
                  <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No tienes direcciones registradas.</p>
                  <Link href="/perfil/direcciones" className="px-6 py-2.5 bg-patu-50 text-patu-600 font-bold rounded-xl hover:bg-patu-100 transition-colors">
                    Añadir Dirección
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {direcciones.map(dir => (
                    <div 
                      key={dir.id_direccion}
                      onClick={() => setIdDireccionSeleccionada(dir.id_direccion)}
                      className={`cursor-pointer rounded-2xl border-2 p-4 transition-all relative ${
                        idDireccionSeleccionada === dir.id_direccion 
                          ? 'border-patu-500 bg-patu-50/30' 
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      {idDireccionSeleccionada === dir.id_direccion && (
                        <CheckCircle2 className="w-5 h-5 text-patu-500 absolute top-4 right-4" />
                      )}
                      <p className="font-bold text-gray-900 mb-1 pr-6">{dir.nombre_direccion}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{dir.direccion}</p>
                      <p className="text-xs text-gray-500">{dir.distrito}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* SECCIÓN 2: MÉTODO DE PAGO */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">2</div>
              <h2 className="text-xl font-bold text-gray-900">Método de Pago</h2>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
              
              {/* Opción Tarjeta */}
              <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${metodoPago === 'tarjeta' ? 'border-patu-500 bg-patu-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
                <input 
                  type="radio" name="pago" value="tarjeta" 
                  checked={metodoPago === 'tarjeta'} onChange={() => setMetodoPago('tarjeta')}
                  className="w-5 h-5 accent-patu-500"
                />
                <CreditCard className={`w-6 h-6 ${metodoPago === 'tarjeta' ? 'text-patu-600' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Tarjeta de Crédito / Débito</p>
                  <p className="text-xs text-gray-500">Pago seguro procesado por Niubiz/Culqi</p>
                </div>
              </label>

              {/* Opción Yape / Plin */}
              <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${metodoPago === 'billetera' ? 'border-patu-500 bg-patu-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
                <input 
                  type="radio" name="pago" value="billetera" 
                  checked={metodoPago === 'billetera'} onChange={() => setMetodoPago('billetera')}
                  className="w-5 h-5 accent-patu-500"
                />
                <Wallet className={`w-6 h-6 ${metodoPago === 'billetera' ? 'text-patu-600' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Yape / Plin</p>
                  <p className="text-xs text-gray-500">Escanea el código QR al confirmar</p>
                </div>
              </label>

            </div>
          </section>

        </div>

        {/* COLUMNA DERECHA (Resumen del Pedido) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-xl text-gray-900 mb-6">Resumen del Pedido</h3>
            
            {/* Lista pequeña de productos */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id_item} className="flex gap-3">
                  <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 py-1">
                    <p className="font-bold text-sm text-gray-900 line-clamp-1">{item.nombre}</p>
                    <p className="text-[10px] text-gray-500 uppercase mt-0.5">{item.atributos}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-medium text-gray-500">Cant: {item.cantidad}</span>
                      <span className="font-bold text-patu-600">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="space-y-3 pt-4 border-t border-gray-100 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>S/ {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Costo de envío</span>
                <span className="text-green-600 font-bold">S/ 0.00</span>
              </div>
              <div className="flex justify-between items-end pt-3">
                <span className="font-bold text-gray-900">Total a Pagar</span>
                <span className="text-2xl font-black text-patu-600">S/ {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleConfirmarPedido}
              disabled={procesando || !idDireccionSeleccionada || direcciones.length === 0}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {procesando ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Procesando pago...</>
              ) : (
                <>Confirmar y Pagar <ChevronRight className="w-5 h-5" /></>
              )}
            </button>

            {/* Confianza */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Transacción 100% segura y encriptada
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Truck className="w-4 h-4 text-blue-500" /> Despacho en menos de 24 hrs hábiles
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}