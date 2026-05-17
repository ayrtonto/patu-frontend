"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, Package, ShoppingCart, Search, 
  Plus, Edit, Trash2, MoreVertical, Image as ImageIcon, 
  Tag, Loader2, AlertCircle
} from "lucide-react";

interface Producto {
  id_producto: number;
  nombre: string;
  precio_base: string;
  en_oferta: boolean;
  porcentaje_descuento: number;
  imagen_principal_url: string;
  productos_categorias: Array<{ categorias: { nombre: string } }>;
}

export default function MisProductosPage() {
  const { user } = useAuth();
  
  const [nombreTienda, setNombreTienda] = useState("Cargando...");
  const [idTienda, setIdTienda] = useState<number | null>(null);
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Obtener la tienda del usuario y luego sus productos
  useEffect(() => {
    const fetchDatos = async () => {
      if (!user?.id_usuario) return;
      
      try {
        // A. Buscar la tienda del usuario
        const resTienda = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tiendas/usuario/${user.id_usuario}`);
        const tiendas = await resTienda.json();
        
        if (tiendas.length > 0) {
          const tiendaActual = tiendas[0];
          setNombreTienda(tiendaActual.nombre_comercial);
          setIdTienda(tiendaActual.id_tienda);

          // B. Buscar los productos de esa tienda
          const resProductos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/tienda/${tiendaActual.id_tienda}`);
          if (resProductos.ok) {
            const data = await resProductos.json();
            setProductos(data);
          }
        } else {
          setNombreTienda("Sin Tienda");
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [user]);

  // Filtrado de productos en el frontend
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
    
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Inventario de Productos</h1>
            <p className="text-sm text-gray-500 mt-1">Gestiona tu catálogo, precios y ofertas.</p>
          </div>
          
          <Link 
            href="/dashboard/productos/nuevo" 
            className="px-5 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-xl shadow-lg hover:bg-black active:scale-95 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Agregar Producto
          </Link>
        </div>

        {/* CONTROLES (BUSCADOR) */}
        <div className="bg-white p-4 rounded-t-3xl border border-gray-100 border-b-0 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 text-sm font-medium transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-100 w-full sm:w-auto transition-colors">
              Filtros
            </button>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div className="bg-white border border-gray-100 rounded-b-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-patu-500 animate-spin" />
            </div>
          ) : productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes productos</h3>
              <p className="text-gray-500 max-w-sm mb-6">Empieza a llenar tu catálogo para que miles de clientes en todo el Perú puedan comprarte.</p>
              <Link href="/dashboard/productos/nuevo" className="px-6 py-3 bg-patu-100 text-patu-700 font-bold rounded-xl hover:bg-patu-200 transition-colors">
                Publicar mi primer producto
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Precio Base</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {productosFiltrados.map((producto) => (
                    <tr key={producto.id_producto} className="hover:bg-gray-50/50 transition-colors group">
                      
                      {/* PRODUCTO (Imagen + Nombre) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center">
                            {producto.imagen_principal_url ? (
                              <img src={producto.imagen_principal_url} alt={producto.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-patu-600 transition-colors">
                              {producto.nombre}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5 tracking-wider uppercase">
                              ID: {producto.id_producto.toString().padStart(5, '0')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORÍA */}
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md w-max">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {producto.productos_categorias?.[0]?.categorias.nombre || "Sin Categoría"}
                        </span>
                      </td>

                      {/* PRECIO */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-black text-gray-900">S/ {Number(producto.precio_base).toFixed(2)}</p>
                          {producto.en_oferta && (
                            <p className="text-[10px] text-red-500 font-bold mt-0.5">-{producto.porcentaje_descuento}% desc.</p>
                          )}
                        </div>
                      </td>

                      {/* ESTADO */}
                      <td className="px-6 py-4">
                        {producto.en_oferta ? (
                          <span className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">En Oferta</span>
                        ) : (
                          <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">Activo</span>
                        )}
                      </td>

                      {/* ACCIONES */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-patu-600 hover:bg-patu-50 rounded-lg transition-all" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                  
                  {productosFiltrados.length === 0 && productos.length > 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm font-medium">
                        <AlertCircle className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        No se encontraron productos con ese nombre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
}