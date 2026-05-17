"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  PackagePlus, Image as ImageIcon, Tag, Save, 
  Palette, Ruler, AlertCircle, RefreshCcw, Layers, Loader2
} from "lucide-react";

// --- INTERFACES BASADAS EN TUS ENDPOINTS ---
interface Categoria {
  id_categoria: number;
  nombre: string;
  slug: string;
}

interface ValorAtributo {
  id_valor: number;
  id_atributo: number;
  valor: string;
}

interface Atributo {
  id_atributo: number;
  nombre: string;
  valores_atributos: ValorAtributo[];
}

interface VarianteFila {
  ids_valores: number[]; // Guardamos los IDs reales para la base de datos (Ej: [1, 5] -> Negro, M)
  label: string;         // Etiqueta visual (Ej: "Negro / M")
  stock: number;
  precio_adicional: number;
  sku: string;
}

export default function NuevoProductoPage() {
  const { user } = useAuth();
  
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  // Añadir este estado al inicio de tu componente para guardar el ID de la tienda del vendedor
  const [idTienda, setIdTienda] = useState<number | null>(null);

  // Puedes obtener el id_tienda consultando tu API, por ejemplo:
  useEffect(() => {
  if (user?.id_usuario) {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tiendas/usuario/${user.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        // Si tiene al menos una tienda, tomamos la primera para asignar los productos
        if (data.length > 0) {
          setIdTienda(data[0].id_tienda);
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (variantes.length === 0) return alert("Debes generar al menos una variante de inventario.");
    
    // Validamos que tengamos el ID de la tienda (Obligatorio para tu backend)
    // Asumiremos que el id_tienda = 1 si no lo tienes cargado dinámicamente aún.
    const currentIdTienda = idTienda || 1; 

    setLoadingSubmit(true);

    try {
      const payload = {
        id_tienda: currentIdTienda,
        nombre: info.nombre,
        descripcion: info.descripcion,
        precio_base: Number(info.precio_base),
        imagen_principal_url: info.imagen_url,
        // Tu backend espera un arreglo de IDs de categorías
        categoriasIds: info.id_categoria ? [info.id_categoria] : [],
        // El arreglo de variantes mapeado exactamente a lo que espera tu DTO
        variantes: variantes.filter(v => v.stock > 0).map(v => ({
          sku: v.sku,
          precio_adicional: v.precio_adicional,
          stock: v.stock,
          valores_ids: v.ids_valores
        }))
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al crear producto en Patu");
      }

      alert("¡Producto publicado con éxito en Gamarra Digital!");
      // Limpiar formulario o redirigir a /dashboard/productos
      window.location.reload();

    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Datos dinámicos desde Patu (Backend)
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [atributosDb, setAtributosDb] = useState<Atributo[]>([]);

  // 1. Información General
  const [info, setInfo] = useState({
    nombre: "",
    descripcion: "",
    precio_base: "",
    imagen_url: "",
    id_categoria: 0
  });

  // 2. Selección Dinámica: Guardamos los valores seleccionados agrupados por Atributo
  // Ej: { 1: [{id_valor: 1, valor: "Negro"}], 2: [{id_valor: 5, valor: "M"}] }
  const [selectedValores, setSelectedValores] = useState<Record<number, ValorAtributo[]>>({});

  // 3. La Matriz Generada
  const [variantes, setVariantes] = useState<VarianteFila[]>([]);

  // --- CARGAR DATOS INICIALES (CATEGORÍAS Y ATRIBUTOS) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCat, resAtr] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categorias`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/atributos`)
        ]);
        
        if (resCat.ok) {
          const catData = await resCat.json();
          setCategorias(catData);
          if (catData.length > 0) setInfo(prev => ({ ...prev, id_categoria: catData[0].id_categoria }));
        }
        
        if (resAtr.ok) setAtributosDb(await resAtr.json());
        
      } catch (error) {
        console.error("Error al cargar datos maestros:", error);
      } finally {
        setLoadingDatos(false);
      }
    };
    fetchData();
  }, []);

  // --- LÓGICA INTELIGENTE: CRUZAR ATRIBUTOS (PRODUCTO CARTESIANO) ---
  useEffect(() => {
    // Obtenemos solo los arrays de valores que tienen al menos 1 elemento seleccionado
    const arraysToCombine = Object.values(selectedValores).filter(arr => arr.length > 0);

    // Si desmarcó todo, vaciamos la tabla
    if (arraysToCombine.length === 0) {
      setVariantes([]);
      return;
    }

    // Función recursiva para cruzar [A,B] con [X,Y] -> [AX, AY, BX, BY]
    const combinarCartesiano = (arrs: ValorAtributo[][]) => 
      arrs.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]] as ValorAtributo[][]);

    const combinaciones = combinarCartesiano(arraysToCombine);

    setVariantes(prev => {
      return combinaciones.map(combo => {
        // Ordenamos los IDs para poder compararlos consistentemente
        const ids = combo.map(c => c.id_valor).sort();
        const label = combo.map(c => c.valor).join(" / ");
        
        // Verificamos si esta fila ya existía para NO borrarle el stock y precio al vendedor
        const filaExistente = prev.find(v => v.ids_valores.sort().join() === ids.join());
        
        if (filaExistente) return filaExistente;

        // Si es nueva, la creamos desde cero
        return {
          ids_valores: ids,
          label: label,
          stock: 0,
          precio_adicional: 0,
          sku: generarSkuSugerido(info.nombre, combo)
        };
      });
    });
  }, [selectedValores]); // Se recalcula cada vez que se marca/desmarca un botón

  // Manejador de clics en los botones de atributos
  const toggleValor = (id_atributo: number, valorObj: ValorAtributo) => {
    setSelectedValores(prev => {
      const actuales = prev[id_atributo] || [];
      const existe = actuales.find(v => v.id_valor === valorObj.id_valor);
      
      if (existe) {
        // Lo quitamos
        return { ...prev, [id_atributo]: actuales.filter(v => v.id_valor !== valorObj.id_valor) };
      } else {
        // Lo agregamos
        return { ...prev, [id_atributo]: [...actuales, valorObj] };
      }
    });
  };

  const generarSkuSugerido = (nombre: string, combo: ValorAtributo[]) => {
    if (!nombre) return "";
    const prefix = nombre.substring(0, 4).toUpperCase().replace(/\s/g, '');
    const suffixes = combo.map(c => c.valor.substring(0, 3).toUpperCase()).join('-');
    return `${prefix}-${suffixes}`;
  };

  const updateVariante = (index: number, campo: keyof VarianteFila, valor: any) => {
    const nuevas = [...variantes];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    setVariantes(nuevas);
  };
/*
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (variantes.length === 0) return alert("Debes seleccionar al menos una variante y ponerle stock.");
    
    const payload = {
      ...info,
      precio_base: Number(info.precio_base),
      // Nos quedamos con las que tengan stock y mapeamos al formato exacto que querrá NestJS
      variantes: variantes.filter(v => v.stock > 0).map(v => ({
        sku: v.sku,
        precio_adicional: v.precio_adicional,
        stock: v.stock,
        valores_ids: v.ids_valores // Enviamos los IDs exactos de la tabla valores_atributos
      }))
    };

    console.log("PAYLOAD LISTO PARA CREAR CON 1 CLIC:", payload);
    // En el próximo paso conectaremos esto con POST /productos
  };
*/
  if (loadingDatos) return <Loader2 className="w-10 h-10 animate-spin mx-auto mt-20 text-patu-500" />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <PackagePlus className="w-8 h-8 text-patu-600" />
          Publicar Nuevo Producto
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* INFO BÁSICA Y CATEGORÍA */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-patu-500" /> Información General
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Categoría</label>
                  <select 
                    value={info.id_categoria} onChange={e => setInfo({...info, id_categoria: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 transition-all font-bold text-gray-700"
                  >
                    {categorias.map(cat => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nombre de la Prenda</label>
                  <input type="text" required value={info.nombre} onChange={e => setInfo({...info, nombre: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Descripción</label>
                  <textarea required rows={4} value={info.descripcion} onChange={e => setInfo({...info, descripcion: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 font-medium resize-none" />
                </div>
              </div>
            </div>

            {/* ATRIBUTOS DINÁMICOS */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Layers className="w-5 h-5 text-patu-500" /> Opciones del Producto
              </h2>
              <p className="text-sm text-gray-500 mb-6">Patu genera la tabla de inventario automáticamente basándose en tu selección.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Dibujamos las secciones dinámicamente según la Base de Datos */}
                {atributosDb.map(atributo => (
                  <div key={atributo.id_atributo}>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      {atributo.nombre === "Color" ? <Palette className="w-4 h-4 text-gray-400" /> : <Ruler className="w-4 h-4 text-gray-400" />} 
                      {atributo.nombre}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {atributo.valores_atributos.map(val => {
                        const estaSeleccionado = selectedValores[atributo.id_atributo]?.find(v => v.id_valor === val.id_valor);
                        
                        return (
                          <button 
                            key={val.id_valor} type="button"
                            onClick={() => toggleValor(atributo.id_atributo, val)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                              estaSeleccionado ? 'border-patu-500 bg-patu-50 text-patu-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            {val.valor}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* TABLA GENERADA */}
              {variantes.length > 0 ? (
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2 text-sm font-bold text-gray-700">
                    Control de Inventario <span className="bg-patu-100 text-patu-600 px-2 py-0.5 rounded-md text-[10px]">{variantes.length} opciones</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3">Variante</th>
                          <th className="px-4 py-3">SKU</th>
                          <th className="px-4 py-3 w-24">Precio Extra</th>
                          <th className="px-4 py-3 w-24">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {variantes.map((v, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 font-bold text-gray-900">{v.label}</td>
                            <td className="px-4 py-2">
                              <input type="text" value={v.sku} onChange={(e) => updateVariante(i, 'sku', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none" />
                            </td>
                            <td className="px-4 py-2">
                              <input type="number" min="0" value={v.precio_adicional} onChange={(e) => updateVariante(i, 'precio_adicional', Number(e.target.value))} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none" />
                            </td>
                            <td className="px-4 py-2">
                              <input type="number" min="0" value={v.stock || ''} onChange={(e) => updateVariante(i, 'stock', Number(e.target.value))} required className="w-full px-2 py-1.5 border border-gray-200 rounded-lg font-bold outline-none focus:border-patu-400" placeholder="0" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed font-medium">Selecciona opciones arriba para generar la tabla de inventario.</p>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Precio Base (S/)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">S/</span>
                  <input type="number" step="0.10" required placeholder="0.00" value={info.precio_base} onChange={e => setInfo({...info, precio_base: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-black text-2xl text-patu-600" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Imagen Principal (URL)</label>
                <div className="flex gap-2">
                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 bg-gray-50 overflow-hidden">
                    {info.imagen_url ? <img src={info.imagen_url} className="w-full h-full object-cover"/> : <ImageIcon className="w-5 h-5 text-gray-400" />}
                  </div>
                  <input type="text" placeholder="https://..." value={info.imagen_url} onChange={e => setInfo({...info, imagen_url: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <button type="submit" disabled={loadingSubmit} className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black rounded-xl flex items-center justify-center gap-2">
                  {loadingSubmit ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Publicar Producto
                </button>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}