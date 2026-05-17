"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { 
  Star, Truck, Store, Zap, Clock, Minus, Plus, 
  ShoppingCart, Heart, ChevronRight, Loader2, ShieldCheck, AlertCircle 
} from "lucide-react";
import Link from 'next/link';

// --- INTERFACES BASADAS EN TU NUEVO JSON ---
interface ValorAtributo {
  valor: string;
  atributos: { nombre: string };
}

interface VarianteDefinicion {
  valores_atributos: ValorAtributo;
}

interface Variante {
  id_variante: number;
  sku: string;
  precio_adicional: string;
  stock: number;
  variante_definicion: VarianteDefinicion[];
}

interface Product {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio_base: string;
  en_oferta: boolean;
  porcentaje_descuento: number;
  imagen_principal_url: string;
  tiendas: { nombre_comercial: string };
  productos_categorias: any[];
  variantes_producto: Variante[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Estado para las selecciones (ej: { "Color": "Negro", "Talla": "M" })
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<Variante | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}`);
        const data = await response.json();
        setProduct(data);

        // Inicializar con la primera variante disponible para que no aparezca vacío
        if (data.variantes_producto?.length > 0) {
          const firstVariant = data.variantes_producto[0];
          const initialAttrs: Record<string, string> = {};
          firstVariant.variante_definicion.forEach((def: any) => {
            initialAttrs[def.valores_atributos.atributos.nombre] = def.valores_atributos.valor;
          });
          setSelectedAttributes(initialAttrs);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Cada vez que cambian los atributos seleccionados, buscamos la variante que coincida
  useEffect(() => {
    if (!product) return;

    const variantMatch = product.variantes_producto.find(v => 
      v.variante_definicion.every(def => 
        selectedAttributes[def.valores_atributos.atributos.nombre] === def.valores_atributos.valor
      )
    );

    setSelectedVariant(variantMatch || null);
  }, [selectedAttributes, product]);

  // Función para obtener todos los nombres de atributos únicos (Color, Talla, etc.)
  const getAttributeNames = () => {
    const names = new Set<string>();
    product?.variantes_producto.forEach(v => {
      v.variante_definicion.forEach(def => names.add(def.valores_atributos.atributos.nombre));
    });
    return Array.from(names);
  };

  // Función para obtener valores únicos de un atributo específico
  const getValuesForAttribute = (attrName: string) => {
    const values = new Set<string>();
    product?.variantes_producto.forEach(v => {
      v.variante_definicion.forEach(def => {
        if (def.valores_atributos.atributos.nombre === attrName) {
          values.add(def.valores_atributos.valor);
        }
      });
    });
    return Array.from(values);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-patu-500 animate-spin" />
      <p className="text-gray-500 font-medium">Cargando detalles...</p>
    </div>
  );

  if (!product) return <div>Producto no encontrado</div>;

  // Cálculos de Precio
  const precioBase = parseFloat(product.precio_base);
  const precioAdicional = selectedVariant ? parseFloat(selectedVariant.precio_adicional) : 0;
  const precioSubtotal = precioBase + precioAdicional;
  const precioFinal = product.en_oferta 
    ? precioSubtotal * (1 - product.porcentaje_descuento / 100) 
    : precioSubtotal;

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
        
        {/* GALERÍA */}
        <div className="w-full lg:w-1/2 p-4 md:p-8">
          <div className="relative aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden group">
            <img 
              src={product.imagen_principal_url || ""} 
              alt={product.nombre} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* INFORMACIÓN Y SELECCIÓN */}
        <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{product.nombre}</h1>
          <p className="text-sm text-patu-600 font-bold mb-6">Vendido por {product.tiendas.nombre_comercial}</p>

          {/* PRECIO DINÁMICO */}
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-patu-600">S/ {precioFinal.toFixed(2)}</span>
              {product.en_oferta && (
                <span className="text-xl text-gray-400 line-through">S/ {precioSubtotal.toFixed(2)}</span>
              )}
            </div>
            {selectedVariant && (
              <p className="text-xs text-gray-500 mt-2 font-medium">SKU: {selectedVariant.sku}</p>
            )}
          </div>

          {/* SELECTORES DE ATRIBUTOS (ESTILO EBAY) */}
          <div className="space-y-6 mb-8">
            {getAttributeNames().map((attrName) => (
              <div key={attrName}>
                <span className="block text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                  {attrName}: <span className="text-patu-600">{selectedAttributes[attrName]}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {getValuesForAttribute(attrName).map((valor) => (
                    <button
                      key={valor}
                      onClick={() => setSelectedAttributes(prev => ({ ...prev, [attrName]: valor }))}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                        selectedAttributes[attrName] === valor
                          ? 'border-patu-500 bg-patu-50 text-patu-600'
                          : 'border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      {valor}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* STOCK Y ACCIONES */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-4">
              {selectedVariant ? (
                selectedVariant.stock > 0 ? (
                  <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> {selectedVariant.stock} unidades disponibles
                  </p>
                ) : (
                  <p className="text-sm font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Agotado en esta combinación
                  </p>
                )
              ) : (
                <p className="text-sm font-bold text-orange-500">Selecciona una combinación</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center justify-between border-2 border-gray-100 rounded-2xl px-3 h-14 w-full sm:w-36 bg-gray-50">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2"><Minus className="w-5 h-5" /></button>
                <span className="font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2"><Plus className="w-5 h-5" /></button>
              </div>
              
              <button 
                disabled={!selectedVariant || selectedVariant.stock === 0}
                onClick={() => addToCart(product.id_producto, quantity, selectedVariant?.id_variante)}
                className="flex-1 bg-patu-600 text-white font-bold h-14 rounded-2xl shadow-lg disabled:opacity-50 disabled:grayscale hover:bg-patu-700 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> 
                {selectedVariant && selectedVariant.stock === 0 ? "Sin Stock" : "Agregar al carrito"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* DESCRIPCIÓN */}
      <div className="mt-8 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción</h2>
        <p className="text-gray-600 leading-relaxed">{product.descripcion}</p>
      </div>
    </main>
  );
}

// Icono faltante
import { Check } from "lucide-react";