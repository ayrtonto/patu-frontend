import SellerSidebar from "@/components/dashboard/SellerSidebar";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // Este div establece la base para toda la sección del vendedor
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* 1. Nuestro nuevo Sidebar unificado */}
      <SellerSidebar />
      
      {/* 2. Aquí Next.js inyectará el contenido de page.tsx dinámicamente */}
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
      
    </div>
  );
}