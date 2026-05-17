"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { MapPin, Plus, Trash2, Home, Briefcase, Loader2, X, Check } from "lucide-react";

interface Direccion {
  id_direccion: number;
  nombre_direccion: string;
  direccion: string;
  distrito: string;
  referencia: string;
  es_principal: boolean;
}

export default function DireccionesPage() {
  const { user } = useAuth();
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newDir, setNewDir] = useState({
    nombre_direccion: "",
    direccion: "",
    distrito: "",
    referencia: "",
    es_principal: false
  });

  // 1. OBTENER Y ORDENAR DIRECCIONES
  const fetchDirecciones = async () => {
    if (!user?.id_usuario) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/direcciones/usuario/${user.id_usuario}`);
      if (res.ok) {
        const data: Direccion[] = await res.json();
        
        // Ordenamos para que la principal siempre esté arriba
        const sortedData = data.sort((a, b) => {
          if (a.es_principal === b.es_principal) return 0;
          return a.es_principal ? -1 : 1;
        });
        
        setDirecciones(sortedData);
      }
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirecciones();
  }, [user]);

  // 2. ACTUALIZAR A PRINCIPAL (Utilizando tu servicio de backend)
  const handleSetPrincipal = async (id_direccion: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/direcciones/${id_direccion}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Enviamos el DTO que espera tu servicio
        body: JSON.stringify({ es_principal: true })
      });

      if (res.ok) {
        // Al tener éxito, el backend ya limpió las otras, así que refrescamos la lista
        fetchDirecciones();
      }
    } catch (error) {
      alert("Error al actualizar la dirección principal");
    }
  };

  // 3. CREAR NUEVA DIRECCIÓN
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/direcciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newDir, id_usuario: user.id_usuario }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewDir({ nombre_direccion: "", direccion: "", distrito: "", referencia: "", es_principal: false });
        fetchDirecciones();
      }
    } catch (error) {
      alert("Error al guardar la dirección");
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-4 py-8">
      <ProfileSidebar />

      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-2xl text-gray-900">Mis Direcciones</h3>
            <p className="text-sm text-gray-500">Tus lugares de entrega para compras en Patu.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-patu-500 hover:bg-patu-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5" /> Nueva Dirección
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-patu-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {direcciones.map((dir) => (
              <div 
                key={dir.id_direccion}
                className={`bg-white rounded-2xl border p-5 transition-all relative flex flex-col justify-between ${
                  dir.es_principal 
                    ? 'border-patu-500 ring-2 ring-patu-500/10 shadow-sm' 
                    : 'border-gray-100 hover:border-patu-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${dir.es_principal ? 'bg-patu-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {dir.nombre_direccion.toLowerCase().includes("casa") ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-gray-900">{dir.nombre_direccion}</span>
                    </div>
                    {dir.es_principal ? (
                      <span className="flex items-center gap-1 text-[10px] bg-patu-50 text-patu-600 font-extrabold px-2 py-1 rounded-full border border-patu-100">
                        <Check className="w-3 h-3" /> PRINCIPAL
                      </span>
                    ) : (
                      <button className="text-gray-300 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-800 font-semibold">{dir.direccion}</p>
                    <p className="text-xs text-gray-500">{dir.distrito}</p>
                    <p className="text-xs text-gray-400 italic mt-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      Ref: {dir.referencia}
                    </p>
                  </div>
                </div>

                {!dir.es_principal && (
                  <button 
                    onClick={() => handleSetPrincipal(dir.id_direccion)}
                    className="mt-5 w-full py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-patu-50 hover:text-patu-600 hover:border-patu-200 transition-all active:scale-95"
                  >
                    Establecer como principal
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL PARA NUEVA DIRECCIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Añadir Nueva Dirección</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1">NOMBRE DE LA DIRECCIÓN</label>
                <input 
                  type="text" placeholder="Ej: Mi casa, Oficina, Casa Padres" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 focus:bg-white transition-all"
                  value={newDir.nombre_direccion} onChange={(e) => setNewDir({...newDir, nombre_direccion: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1">DIRECCIÓN COMPLETA</label>
                <input 
                  type="text" placeholder="Av, Calle, Jirón y número" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 focus:bg-white transition-all"
                  value={newDir.direccion} onChange={(e) => setNewDir({...newDir, direccion: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1">DISTRITO</label>
                  <input 
                    type="text" placeholder="Ej: San Luis" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 focus:bg-white transition-all"
                    value={newDir.distrito} onChange={(e) => setNewDir({...newDir, distrito: e.target.value})}
                  />
                </div>
                <div className="flex items-center justify-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" className="w-5 h-5 accent-patu-500 rounded border-gray-300"
                      checked={newDir.es_principal} onChange={(e) => setNewDir({...newDir, es_principal: e.target.checked})}
                    />
                    <span className="text-sm font-semibold text-gray-600 group-hover:text-patu-600">¿Principal?</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1">REFERENCIA</label>
                <textarea 
                  placeholder="Ej: Portón verde, al lado de la farmacia..." required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patu-500 focus:bg-white transition-all h-24 resize-none"
                  value={newDir.referencia} onChange={(e) => setNewDir({...newDir, referencia: e.target.value})}
                ></textarea>
              </div>

              <button type="submit" className="w-full py-4 bg-patu-500 hover:bg-patu-600 text-white font-bold rounded-xl shadow-lg shadow-patu-500/30 active:scale-95 transition-all mt-2">
                Guardar Dirección
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}