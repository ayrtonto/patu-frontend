"use client";

import Link from "next/link";
import { Store, TrendingUp, Wallet, ShieldCheck, ChevronRight, CheckCircle2 } from "lucide-react";

export default function VendedoresLandingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <div className="bg-gray-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-patu-600/30 to-transparent skew-x-12 transform origin-bottom-right"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <span className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase mb-6 text-patu-300">
            Patu Seller Center
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Lleva tu galería de Gamarra <br />
            <span className="text-patu-500">a todo el Perú.</span>
          </h1>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl">
            Abre tu tienda virtual en minutos. Llega a miles de clientes, gestiona tus envíos fácilmente y recibe tus pagos directo en tu cuenta bancaria con una de las comisiones más bajas del mercado.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/vendedores/registro" 
              className="px-8 py-4 bg-patu-500 hover:bg-patu-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-patu-500/20 active:scale-95"
            >
              <Store className="w-5 h-5" />
              Crear mi tienda ahora
            </Link>
             {/* <Link 
              href="/login" 
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur transition-all flex items-center justify-center"
            >
              Ya soy vendedor
            </Link> */}
          </div>
        </div>
      </div>

      {/* BENEFICIOS */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-4">¿Por qué vender en Patu?</h2>
          <p className="text-gray-500">Diseñado para los empresarios textiles que buscan crecer.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow group">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Comisión justa del 5%</h3>
            <p className="text-gray-500 leading-relaxed">
              Sin cobros ocultos ni mensualidades. Solo pagas una pequeña comisión de éxito cuando tu producto ya está vendido.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow group">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Wallet className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Pagos Seguros y Rápidos</h3>
            <p className="text-gray-500 leading-relaxed">
              Liquidaciones automáticas a tu cuenta bancaria o Yape. Tu dinero está seguro y disponible cuando lo necesites.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow group">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Logística Integrada</h3>
            <p className="text-gray-500 leading-relaxed">
              Tú solo empacas, nosotros nos encargamos de guiar al cliente y asegurar que el producto llegue a su destino en todo el país.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}