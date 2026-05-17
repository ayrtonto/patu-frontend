"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { Save, Loader2 } from "lucide-react";

export default function PersonalInfoPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    telefono: ""
  });

  // Sincronizar el formulario con los datos del contexto al cargar
  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nombres,
        apellidos: user.apellidos,
        telefono: user.telefono || ""
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${user?.id_usuario}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error al actualizar");

      const usuarioActualizado = await response.json();
      
      // Actualizamos el contexto global
      updateUser(usuarioActualizado);
      alert("Información actualizada con éxito");
    } catch (error) {
      alert("No se pudo actualizar la información");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* AGREGADO: max-w-7xl mx-auto px-4 py-8 para igualar el ancho de Cuenta y Pedidos */
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-4 py-8">
      <ProfileSidebar />
      
      <div className="flex-1">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 transition-all hover:shadow-md">
          <div className="mb-6">
            <h3 className="font-bold text-xl text-gray-900 mb-1">Información Personal</h3>
            <p className="text-sm text-gray-500">Actualiza tus datos para agilizar tus compras y envíos en Patu.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombres</label>
                <input 
                  type="text" 
                  value={formData.nombres}
                  onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-patu-500 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellidos</label>
                <input 
                  type="text" 
                  value={formData.apellidos}
                  onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-patu-500 text-sm transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono Móvil</label>
                <input 
                  type="tel" 
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-patu-500 text-sm transition-all"
                  placeholder="+51 ..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-patu-500 hover:bg-patu-600 text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-70 active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}