export type OrderLine = {
  id: string;
  halfId?: string;
  name: string;
  size: "grande" | "individual";
  quantity: number;
  price: number;
  note: string;
};
export type DonnaOrder = {
  id: string;
  total: number;
  demo: number;
  status: string;
  payment: string;
  created: number;
  data: {
    lines: OrderLine[];
    fulfillment: string;
    subtotal: number;
    delivery: number;
    discount: number;
    checkoutUrl?: string | null;
  };
};
export function demoOrders(): DonnaOrder[] {
  try {
    const raw = JSON.parse(
      localStorage.getItem("donna-demo-orders-v3") || "[]",
    );
    return Array.isArray(raw)
      ? raw
          .filter(
            (o) =>
              o &&
              typeof o.id === "string" &&
              o.demo === 1 &&
              Array.isArray(o.data?.lines),
          )
          .slice(0, 30)
      : [];
  } catch {
    return [];
  }
}
export function rememberDemo(order: DonnaOrder) {
  const next = [order, ...demoOrders().filter((o) => o.id !== order.id)].slice(
    0,
    30,
  );
  localStorage.setItem("donna-demo-orders-v3", JSON.stringify(next));
}
export async function fetchOrders(): Promise<DonnaOrder[]> {
  const r = await fetch("/api/orders", { cache: "no-store" });
  const d = (await r.json()) as {
    error?: string;
    storage?: string;
    orders: DonnaOrder[];
  };
  if (!r.ok) throw Error(d.error || "Não foi possível consultar seus pedidos.");
  return d.storage === "browser" ? demoOrders() : d.orders;
}
