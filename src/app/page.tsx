"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronLeft, ChevronRight, Zap, Shirt, UserCheck, 
  Loader2, Store, Heart, ShoppingCart
} from "lucide-react";

// Interfaces para mapear los datos del backend
interface Producto {
  id_producto: number;
  nombre: string;
  precio_base: string;
  en_oferta: boolean;
  porcentaje_descuento: number;
  imagen_principal_url: string;
  tiendas?: { nombre_comercial: string };
  productos_categorias?: Array<{ categorias: { nombre: string } }>;
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 2;

  // Estados para los productos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // --- OBTENER PRODUCTOS DEL BACKEND ---
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch("http://localhost:3000/productos");
        if (res.ok) {
          const data = await res.json();
          setProductos(data);
        }
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // --- LÓGICA DEL CARRUSEL ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);

  // Filtramos los productos en oferta
  const ofertasFlash = productos.filter((p) => p.en_oferta);
  // Para la malla inferior podemos usar todos (o los que no están en oferta)
  const productosVariados = productos.slice(0, 15); // Limitamos a 15 para no saturar

  return (
    <div className="pb-12 bg-gray-50 min-h-screen">
      {/* SECCIÓN 1: CARRUSEL HERO */}
      <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden bg-white">
        <div 
          className="flex transition-transform duration-500 h-full w-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          <div className="min-w-full h-full bg-gradient-to-r from-patu-500 to-patu-600 flex items-center justify-center p-6 text-white relative">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-white/10 skew-x-12 transform origin-top-right"></div>
            <div className="relative z-10 text-center md:text-left md:w-full md:max-w-4xl md:px-8">
              <span className="inline-block px-2 py-1 bg-white/20 text-xs font-semibold rounded mb-2">Envíos a todo Perú</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Gamarra Digital</h2>
              <p className="text-sm md:text-base text-patu-100 mb-4 max-w-sm mx-auto md:mx-0">Directo de las mejores galerías a la puerta de tu casa o negocio.</p>
              <button className="bg-white text-patu-600 px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-50 active:scale-95 transition-all">Explorar ahora</button>
            </div>
          </div>
          <div className="min-w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center p-6 text-white relative">
            <div className="relative z-10 text-center md:text-left md:w-full md:max-w-4xl md:px-8">
              <span className="inline-block px-2 py-1 bg-white/20 text-xs font-semibold rounded mb-2">Nueva Colección</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Temporada Invierno</h2>
              <p className="text-sm md:text-base text-blue-100 mb-4 max-w-sm mx-auto md:mx-0">Descubre casacas, poleras y abrigos al por mayor.</p>
              <button className="bg-white text-blue-600 px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-50 active:scale-95 transition-all">Ver catálogo</button>
            </div>
          </div>
        </div>
        
        <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full shadow backdrop-blur transition-all">
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full shadow backdrop-blur transition-all">
          <ChevronRight className="w-5 h-5 text-gray-800" />
        </button>
        
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          <button onClick={() => setCurrentSlide(0)} className={`w-2 h-2 rounded-full transition-all ${currentSlide === 0 ? 'bg-white' : 'bg-white/50'}`}></button>
          <button onClick={() => setCurrentSlide(1)} className={`w-2 h-2 rounded-full transition-all ${currentSlide === 1 ? 'bg-white' : 'bg-white/50'}`}></button>
        </div>
      </div>

      {/* CONTENEDOR CENTRAL */}
      <div className="px-4 pt-8 space-y-10 max-w-7xl mx-auto">
        
        {/* CARGANDO ESTADO */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-patu-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* SECCIÓN 2: OFERTAS FLASH DINÁMICAS */}
            {ofertasFlash.length > 0 && (
              <section className="bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl p-5 md:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6 fill-white" />
                    <h3 className="font-bold text-xl md:text-2xl tracking-tight">Ofertas Flash</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-xl text-sm md:text-base font-mono backdrop-blur font-bold shadow-inner">
                    <span>02</span>:<span>45</span>:<span>30</span>
                  </div>
                </div>
                
                {/* Scroll Horizontal de Ofertas */}
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-3 pt-1 -mx-2 px-2 snap-x">
                  {ofertasFlash.map((producto) => {
                    const precioBase = Number(producto.precio_base);
                    const precioDescuento = precioBase * (1 - producto.porcentaje_descuento / 100);

                    return (
                      <Link 
                        key={producto.id_producto}
                        href={`/producto/${producto.id_producto}`} 
                        className="snap-start flex-shrink-0 w-40 md:w-48 bg-white rounded-2xl p-3 text-gray-900 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative flex flex-col"
                      >
                        <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                          <img 
                            src={producto.imagen_principal_url || "https://via.placeholder.com/400"} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            alt={producto.nombre} 
                          />
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-md animate-pulse">
                            -{producto.porcentaje_descuento}%
                          </span>
                        </div>
                        <h4 className="text-sm font-bold leading-tight mb-2 line-clamp-2 group-hover:text-patu-600 transition-colors flex-1">
                          {producto.nombre}
                        </h4>
                        <div className="flex items-end gap-2 mb-3">
                          <p className="text-xl font-black text-patu-600 leading-none">S/ {precioDescuento.toFixed(2)}</p>
                          <p className="text-xs text-gray-400 line-through leading-none mb-0.5 font-medium">S/ {precioBase.toFixed(2)}</p>
                        </div>
                        <div className="w-full bg-red-100 rounded-full h-1.5 mb-1.5">
                          <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-wider">¡Se agota!</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECCIÓN 3: CATEGORÍAS */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-900 text-xl tracking-tight">Explorar Categorías</h3>
              </div>
              <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white rounded-3xl border border-gray-100 hover:shadow-md hover:border-patu-200 active:scale-95 transition-all group aspect-square">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <UserCheck className="w-7 h-7 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-bold text-center">Hombre</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white rounded-3xl border border-gray-100 hover:shadow-md hover:border-patu-200 active:scale-95 transition-all group aspect-square">
                  <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                    <Shirt className="w-7 h-7 text-pink-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-bold text-center">Mujer</span>
                </button>
                {/* Puedes añadir más categorías estáticas aquí si lo deseas */}
              </div>
            </section>

            {/* SECCIÓN 4: MALLA DE PRODUCTOS VARIADOS (DESCUBRE MÁS) */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-gray-900 text-2xl tracking-tight">Descubre Más</h3>
                <Link href="/catalogo" className="text-sm font-bold text-patu-600 hover:underline">Ver todo</Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {productosVariados.map((producto) => {
                  const precioBase = Number(producto.precio_base);
                  const precioFinal = producto.en_oferta 
                    ? precioBase * (1 - producto.porcentaje_descuento / 100) 
                    : precioBase;

                  return (
                    <Link 
                      key={producto.id_producto}
                      href={`/producto/${producto.id_producto}`}
                      className="bg-white rounded-3xl border border-gray-100 p-3 hover:shadow-xl hover:border-patu-200 transition-all duration-300 group flex flex-col relative"
                    >
                      {/* Botón Favorito Flotante */}
                      <button className="absolute top-5 right-5 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100">
                        <Heart className="w-4 h-4" />
                      </button>

                      <div className="relative aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden mb-3">
                        <img 
                          src={producto.imagen_principal_url || "https://via.placeholder.com/400"} 
                          alt={producto.nombre} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {producto.en_oferta && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                            -{producto.porcentaje_descuento}%
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Store className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">
                            {producto.tiendas?.nombre_comercial || "Tienda Patu"}
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-gray-900 text-sm leading-tight mb-3 line-clamp-2 group-hover:text-patu-600 transition-colors">
                          {producto.nombre}
                        </h4>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div>
                            <p className="font-black text-lg text-gray-900 leading-none">S/ {precioFinal.toFixed(2)}</p>
                            {producto.en_oferta && (
                              <p className="text-xs text-gray-400 line-through font-medium mt-0.5">S/ {precioBase.toFixed(2)}</p>
                            )}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-patu-50 flex items-center justify-center group-hover:bg-patu-600 group-hover:text-white transition-colors text-patu-600">
                            <ShoppingCart className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}