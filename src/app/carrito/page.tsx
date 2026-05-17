"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Truck } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8 text-center">¡Explora las mejores prendas de Gamarra y llena tu carrito!</p>
        <Link href="/" className="px-8 py-3 bg-patu-600 text-white font-bold rounded-2xl hover:bg-patu-700 transition-all">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Mi Carrito ({totalItems})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LISTA DE PRODUCTOS */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id_item} className="bg-white rounded-3xl border border-gray-100 p-4 md:p-6 flex gap-4 md:gap-6 shadow-sm">
              <div className="w-24 h-32 md:w-32 md:h-40 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 md:text-lg line-clamp-1">{item.nombre}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id_item)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Aquí usamos "atributos" para soportar "Negro / M" y mostramos la tienda */}
                  <p className="text-xs text-gray-500 font-medium uppercase mt-1">
                    Opción: {item.atributos} • Tienda: {item.tienda}
                  </p>
                  <p className="font-black text-patu-600 mt-2 text-lg">S/ {item.precio.toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-2 py-1">
                    {/* Botón Restar */}
                    <button 
                      onClick={() => updateQuantity(item.id_item, item.cantidad - 1)}
                      disabled={item.cantidad <= 1}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="font-bold text-gray-900 w-4 text-center">{item.cantidad}</span>
                    
                    {/* Botón Sumar */}
                    <button 
                      onClick={() => updateQuantity(item.id_item, item.cantidad + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold text-gray-900">Subtotal: S/ {(item.precio * item.cantidad).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RESUMEN DE PAGO */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-xl text-gray-900 mb-6">Resumen de compra</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Productos ({totalItems})</span>
                <span>S/ {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className="text-green-600 font-bold">Gratis</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                <span className="font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-patu-600">S/ {totalPrice.toFixed(2)}</p>
                  <p className="text-[10px] text-gray-400 font-medium">IGV incluido</p>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-patu-600 text-white font-bold rounded-2xl shadow-xl shadow-patu-600/20 hover:bg-patu-700 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              Continuar compra
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="mt-6 flex items-center gap-3 p-4 bg-patu-50 rounded-2xl border border-patu-100 text-patu-700">
              <Truck className="w-5 h-5 flex-shrink-0" />
              <p className="text-[11px] font-medium leading-tight">
                ¡Llega mañana! Compra en las próximas 2 horas para recibirlo pronto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}