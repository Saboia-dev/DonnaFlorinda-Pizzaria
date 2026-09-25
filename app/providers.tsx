"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { Toaster, toast } from "sonner";
import {
  seedProducts,
  initialSettings,
  Product,
  CartItem,
  StoreSettings,
} from "@/lib/catalog";
type Store = {
  products: Product[];
  settings: StoreSettings;
  cart: CartItem[];
  setCart: (items: CartItem[]) => void;
  add: (item: CartItem) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  loaded: boolean;
  error: string;
};
const Context = createContext<Store>(null!);
export function useStore() {
  return useContext(Context);
}
export default function Providers({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState(seedProducts),
    [settings, setSettings] = useState(initialSettings),
    [cart, setCartState] = useState<CartItem[]>([]),
    [cartOpen, setCartOpen] = useState(false),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState("");
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const setCart = (items: CartItem[]) => {
    cartRef.current = items;
    setCartState(items);
    try {
      localStorage.setItem("donna-cart-draft", JSON.stringify(items));
    } catch {}
  };
  useEffect(() => {
    try {
      const draft = JSON.parse(
        localStorage.getItem("donna-cart-draft") || "[]",
      );
      if (Array.isArray(draft))
        setCartState(
          draft
            .filter(
              (x) =>
                typeof x.id === "string" &&
                seedProducts.some((p) => p.id === x.id) &&
                ["grande", "individual"].includes(x.size) &&
                typeof x.note === "string" &&
                Number.isInteger(x.quantity) &&
                x.quantity > 0 &&
                x.quantity <= 20,
            )
            .slice(0, 20),
        );
    } catch {}
    fetch("/api/catalog")
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d: any) => {
        setProducts(d.products);
        setSettings(d.settings);
      })
      .catch(() =>
        setError(
          "Não foi possível atualizar o cardápio. Tente recarregar a página.",
        ),
      )
      .finally(() => setLoaded(true));
  }, []);
  const add = (item: CartItem) => {
    const current = cartRef.current;
    if (current.reduce((n, x) => n + x.quantity, 0) + item.quantity > 20) {
      toast.error("Limite de 20 itens por pedido.");
      return;
    }
    const idx = current.findIndex(
      (x) =>
        x.id === item.id &&
        x.halfId === item.halfId &&
        x.size === item.size &&
        x.note === item.note,
    );
    const next = [...current];
    if (idx >= 0)
      next[idx] = {
        ...next[idx],
        quantity: Math.min(20, next[idx].quantity + item.quantity),
      };
    else next.push(item);
    setCart(next);
    toast.success("Sua escolha foi adicionada ao pedido.");
  };
  useEffect(() => {
    const model = (document as any).modelContext;
    if (!model?.registerTool) return;
    const lifecycle = new AbortController();
    Promise.resolve(
      model.registerTool(
        {
          name: "read_pizza_menu",
          description:
            "Consulta o cardápio exibido, preços em centavos e disponibilidade. Não cria pedidos.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true },
          execute: (input: any) => {
            if (input && Object.keys(input).length)
              throw Error("Nenhum parâmetro é aceito.");
            return { products, demonstration: !settings.ordersEnabled };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
    return () => lifecycle.abort();
  }, [products, settings.ordersEnabled]);
  return (
    <Context.Provider
      value={{
        products,
        settings,
        cart,
        setCart,
        add,
        cartOpen,
        setCartOpen,
        loaded,
        error,
      }}
    >
      {children}
      <Toaster richColors position="bottom-center" />
    </Context.Provider>
  );
}
