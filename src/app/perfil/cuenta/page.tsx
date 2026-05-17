"use client";

import { useAuth } from "@/context/AuthContext";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { Shield, Mail, CheckCircle2, Lock, Smartphone, Trash2, ChevronRight } from "lucide-react";

export default function AccountDataPage() {
  const { user } = useAuth();

  // Si el usuario no ha cargado, no mostramos nada para evitar saltos visuales
  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-4 py-8">
      {/* Sidebar compartido y dinámico */}
      <ProfileSidebar />

      <div className="flex-1 space-y-6">
        
        {/* SECCIÓN: CORREO ELECTRÓNICO */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Correo Electrónico</h3>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-900">{user.email}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Correo verificado
              </p>
            </div>
            <button 
              onClick={() => alert("Función de cambio de correo próximamente")}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all active:scale-95"
            >
              Cambiar correo
            </button>
          </div>
        </div>

        {/* SECCIÓN: CONTRASEÑA Y SEGURIDAD */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Contraseña y Seguridad</h3>
          </div>
          
          {/* Cambio de Contraseña */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-gray-900">Contraseña</p>
                <p className="text-xs text-gray-500 mt-1">Protege tu cuenta con una clave segura</p>
              </div>
            </div>
            <button 
              onClick={() => alert("Ruta de actualización de contraseña en desarrollo")}
              className="px-5 py-2.5 bg-patu-50 text-patu-600 rounded-xl text-sm font-bold hover:bg-patu-100 transition-all active:scale-95"
            >
              Actualizar contraseña
            </button>
          </div>

          {/* 2FA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-gray-900">Autenticación en 2 pasos (2FA)</p>
                <p className="text-xs text-gray-500 mt-1">Añade una capa extra de seguridad para tu cuenta y tus compras</p>
              </div>
            </div>
            <button className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
              Configurar
            </button>
          </div>
        </div>

        {/* ZONA DE PELIGRO */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 mt-8">
          <div className="flex items-center gap-3 mb-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            <h3 className="font-bold text-lg">Zona de Peligro</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Una vez que elimines tu cuenta, no hay vuelta atrás. Perderás tus pedidos, direcciones y cupones guardados en Patu.
          </p>
          <button 
            onClick={() => confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.")}
            className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all active:scale-95"
          >
            Eliminar cuenta definitivamente
          </button>
        </div>

      </div>
    </div>
  );
}