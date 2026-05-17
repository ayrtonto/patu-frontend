"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id_item: number;
  id_producto: number;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
  tienda: string;
  atributos: string;
  id_variante?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (id_producto: number, cantidad: number, id_variante?: number) => Promise<void>;
  removeFromCart: (id_item: number) => Promise<void>;
  updateQuantity: (id_item: number, nuevaCantidad: number) => Promise<void>;
  clearCart: () => void; // 1. Agregado a la interfaz
  totalItems: number;
  totalPrice: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  const refreshCart = async () => {
    if (!isLoggedIn || !user?.id_usuario) {
      setCart([]);
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carritos/usuario/${user.id_usuario}`);
      
      if (res.status === 404) {
        setCart([]);
        return;
      }

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      
      const data = await res.json();
      
      if (!data || !data.items_carrito) {
        setCart([]);
        return;
      }

      const itemsMapeados = data.items_carrito.map((item: any) => {
        const attrsArray = item.variantes_producto?.variante_definicion?.map(
          (def: any) => def.valores_atributos.valor
        ) || [];

        return {
          id_item: item.id_item,
          id_producto: item.id_producto,
          nombre: item.productos.nombre,
          precio: Number(item.productos.precio_base), 
          imagen: item.productos.imagen_principal_url,
          cantidad: item.cantidad,
          tienda: item.productos.tiendas?.nombre_comercial || "Tienda Patu",
          atributos: attrsArray.join(" / ") || "Única",
          id_variante: item.id_variante
        };
      });

      // Ordenamiento por id_item (mantiene el orden de inserción)
      itemsMapeados.sort((a: CartItem, b: CartItem) => a.id_item - b.id_item);
      setCart(itemsMapeados);

    } catch (error) {
      console.error("Error al obtener carrito de la BD:", error);
      setCart([]);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isLoggedIn, user]);

  const addToCart = async (id_producto: number, cantidad: number, id_variante?: number) => {
    if (!isLoggedIn || !user?.id_usuario) return alert("Debes iniciar sesión para agregar al carrito");
    
    try {
      const payload = {
        id_usuario: user.id_usuario,
        id_producto,
        cantidad,
        ...(id_variante ? { id_variante } : {})
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carritos/agregar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`No se pudo agregar: ${errorData.message || 'Error del servidor'}`);
        return;
      }

      await refreshCart();
      
    } catch (error) {
      console.error("Error de conexión al agregar:", error);
    }
  };

  const removeFromCart = async (id_item: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carritos/item/${id_item}`, { method: "DELETE" });
      await refreshCart();
    } catch (error) {
      console.error("Error al eliminar", error);
    }
  };

  const updateQuantity = async (id_item: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    
    setCart(prev => prev.map(item => item.id_item === id_item ? { ...item, cantidad: nuevaCantidad } : item));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carritos/item/${id_item}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      });

      if (!res.ok) throw new Error("Fallo al actualizar cantidad en BD");
      
      refreshCart();
    } catch (error) {
      console.error("Revirtiendo actualización:", error);
      refreshCart();
    }
  };

  // 2. Implementación de la función clearCart
  const clearCart = () => {
    setCart([]); // Limpia el estado local inmediatamente
  };

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    // 3. Agregado clearCart al Provider
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
};