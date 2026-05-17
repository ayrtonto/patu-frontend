"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Store, Building2, CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function StoreRegistrationPage() {
  const router = useRouter();
  const { user, isLoggedIn, updateUser } = useAuth(); // Necesitaremos actualizar el contexto si su rol cambia
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_comercial: "",
    ruc: "",
    entidad_bancaria: "BCP",
    numero_cuenta: "",
    titular_cuenta: ""
  });

  // Si no está logueado, le pedimos que inicie sesión primero
  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <Store className="w-16 h-16 text-gray-300 mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Inicia sesión primero</h2>
        <p className="text-gray-500 text-center max-w-md mb-8">
          Para abrir una tienda, necesitas tener una cuenta en Patu. Si ya tienes una cuenta de cliente, úsala para continuar.
        </p>
        <Link href="/login" className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all">
          Iniciar Sesión / Registrarse
        </Link>
      </div>
    );
  }

  // Si ya es vendedor, lo mandamos al dashboard
  if (user?.rol === "VENDEDOR" || user?.rol === "ADMIN") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Ya tienes una tienda</h2>
        <p className="text-gray-500 text-center max-w-md mb-8">
          Tu cuenta ya está configurada como Vendedor. Ve a tu panel de control para subir productos.
        </p>
        <Link href="/dashboard" className="px-8 py-3 bg-patu-600 text-white font-bold rounded-xl hover:bg-patu-700 transition-all">
          Ir al Dashboard de Vendedor
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Llamada a tu API para crear la tienda y actualizar el rol del usuario
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tiendas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id_propietario: user?.id_usuario // Vinculamos la tienda con el usuario actual
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al crear la tienda");
      }

      // 2. Simulamos que el backend le cambió el rol a "VENDEDOR" y actualizamos el contexto local
      updateUser({ ...user!, rol: "VENDEDOR" });

      alert("¡Felicidades! Tu tienda ha sido creada con éxito.");
      router.push("/dashboard"); // Lo mandamos a su panel de control

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="bg-patu-100 text-patu-600 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">Registro de Vendedor</span>
          <h1 className="text-3xl font-black text-gray-900 mt-4 mb-2">Abre tu tienda en Patu</h1>
          <p className="text-gray-500">Ingresa los datos de tu negocio para poder recibir tus pagos.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* DATOS DEL NEGOCIO */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold border-b border-gray-100 pb-2">
                <Building2 className="w-5 h-5 text-patu-500" /> Datos del Negocio
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nombre Comercial (Como lo verán los clientes)</label>
                  <input 
                    type="text" required placeholder="Ej: Creaciones María"
                    value={formData.nombre_comercial} onChange={(e) => setFormData({...formData, nombre_comercial: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Número de RUC</label>
                  <input 
                    type="text" required maxLength={11} placeholder="10... o 20..."
                    value={formData.ruc} onChange={(e) => setFormData({...formData, ruc: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </section>

            {/* DATOS BANCARIOS */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold border-b border-gray-100 pb-2">
                <CreditCard className="w-5 h-5 text-patu-500" /> Datos de Liquidación
              </div>
              <p className="text-xs text-gray-400 mb-4">Aquí te transferiremos el dinero de tus ventas (menos el 5% de comisión).</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Banco</label>
                  <select 
                    value={formData.entidad_bancaria} onChange={(e) => setFormData({...formData, entidad_bancaria: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 focus:bg-white transition-all font-medium"
                  >
                    <option value="BCP">BCP (Banco de Crédito)</option>
                    <option value="Interbank">Interbank</option>
                    <option value="BBVA">BBVA</option>
                    <option value="Scotiabank">Scotiabank</option>
                    <option value="Yape">Yape (Solo si es RUC 10)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Número de Cuenta</label>
                  <input 
                    type="text" required placeholder="Número de cuenta bancaria"
                    value={formData.numero_cuenta} onChange={(e) => setFormData({...formData, numero_cuenta: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Titular de la cuenta</label>
                  <input 
                    type="text" required placeholder="Debe coincidir con el RUC"
                    value={formData.titular_cuenta} onChange={(e) => setFormData({...formData, titular_cuenta: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </section>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white font-black rounded-xl shadow-xl hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Store className="w-5 h-5" />}
              {loading ? "Registrando tienda..." : "Crear Tienda"}
            </button>
            
            <p className="text-[11px] text-center text-gray-400 mt-4 leading-relaxed">
              Al hacer clic en "Crear Tienda", aceptas los Términos y Condiciones de Patu Seller Center y confirmas que la información ingresada es verídica.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}