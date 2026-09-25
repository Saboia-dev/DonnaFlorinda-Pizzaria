"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  Flame,
  Check,
  Package,
  Clock3,
} from "lucide-react";
import { Header, Footer } from "../storefront";
import { money } from "@/lib/catalog";
import { fetchOrders, DonnaOrder } from "../demo-orders";
import { useStore } from "../providers";
const labels: Record<string, string> = {
  demo: "Demonstração concluída",
  aguardando_pagamento: "Aguardando pagamento",
  falha_pagamento: "Pagamento não iniciado",
  recebido: "Recebido",
  preparando: "No forno",
  pronto: "Pronto",
  concluido: "Concluído",
  cancelado: "Cancelado",
  contestado: "Pagamento contestado",
};
export default function Orders() {
  const { products, setCart, setCartOpen } = useStore();
  const [orders, setOrders] = useState<DonnaOrder[]>([]),
    [loading, setLoading] = useState(true),
    [refreshing, setRefreshing] = useState(false),
    [error, setError] = useState("");
  async function load() {
    setRefreshing(true);
    try {
      setOrders(await fetchOrders());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível consultar.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }
  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);
  function repeat(o: DonnaOrder) {
    const valid = o.data.lines.every(
      (x) =>
        products.some((p) => p.id === x.id && p.available) &&
        (!x.halfId || products.some((p) => p.id === x.halfId && p.available)),
    );
    if (!valid) {
      setError(
        "Um dos sabores está indisponível. Escolha novamente pelo cardápio.",
      );
      return;
    }
    setCart(
      o.data.lines.map(({ id, halfId, size, quantity, note }) => ({
        id,
        halfId,
        size,
        quantity,
        note,
      })),
    );
    setCartOpen(true);
  }
  return (
    <div className="inner-shell">
      <Header />
      <main id="conteudo">
        <section className="orders-hero">
          <div>
            <p className="eyebrow">DA NOSSA COZINHA ATÉ VOCÊ</p>
            <h1>
              Cada pedido,
              <br />
              <em>um bom momento.</em>
            </h1>
            <p>Suas escolhas e o cuidado em cada etapa.</p>
          </div>
          <ShoppingBag size={150} strokeWidth={0.6} />
        </section>
        <section className="section orders-content">
          <div className="row between orders-toolbar">
            <p>
              {orders.length}{" "}
              {orders.length === 1
                ? "pedido neste navegador"
                : "pedidos neste navegador"}
            </p>
            <button
              className="button outline"
              disabled={refreshing}
              onClick={load}
            >
              <RefreshCw size={17} className={refreshing ? "spin" : ""} />
              Atualizar
            </button>
          </div>
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}
          {loading ? (
            <p role="status">Consultando seus pedidos…</p>
          ) : !orders.length && !error ? (
            <div className="empty-state">
              <ShoppingBag size={52} />
              <h3>A primeira fatia é só o começo.</h3>
              <p>Depois de concluir o checkout, seu pedido aparece aqui.</p>
              <Link href="/cardapio" className="button primary">
                Encontrar meu sabor
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            orders.map((o) => (
              <article className="order-card deluxe-order" key={o.id}>
                <div className="row between">
                  <div>
                    <p className="eyebrow red">
                      {o.demo ? "EXPERIÊNCIA DONNA" : "SEU PEDIDO"}
                    </p>
                    <h3>#{o.id.slice(0, 8).toUpperCase()}</h3>
                    <p className="small muted">
                      {new Date(o.created).toLocaleString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                      })}
                    </p>
                  </div>
                  <span className="status-badge">
                    {labels[o.status] || o.status}
                  </span>
                </div>
                {o.demo ? (
                  <div className="demo-strip">
                    <Check size={21} />
                    <span>
                      Teste concluído. Não há cobrança, preparo ou entrega.
                    </span>
                  </div>
                ) : (
                  <div className="order-steps">
                    {[
                      { s: "recebido", Icon: Check },
                      { s: "preparando", Icon: Flame },
                      { s: "pronto", Icon: Package },
                      { s: "concluido", Icon: Check },
                    ].map(({ s, Icon }, i) => (
                      <div
                        key={s}
                        className={`order-step ${i <= ["recebido", "preparando", "pronto", "concluido"].indexOf(o.status) ? "active" : ""}`}
                      >
                        <Icon size={20} />
                        {labels[s]}
                      </div>
                    ))}
                  </div>
                )}
                <div className="order-items">
                  {o.data.lines.map((x, i) => (
                    <div className="row between" key={i}>
                      <div>
                        <strong>
                          {x.quantity}× {x.name}
                        </strong>
                        <p className="small muted">
                          {x.size === "grande"
                            ? "Grande · 8 fatias"
                            : "Broto · 4 fatias"}
                          {x.note && ` · ${x.note}`}
                        </p>
                      </div>
                      <span>{money(x.quantity * x.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="row between order-total">
                  <span>
                    {o.data.fulfillment === "pickup"
                      ? "Retirada na pizzaria"
                      : "Entrega no endereço informado"}
                  </span>
                  <strong>{money(o.total)}</strong>
                </div>
                <div className="order-actions">
                  <Link
                    className="button primary"
                    href={`/pagamento?pedido=${o.id}`}
                  >
                    Ver pagamento
                    <ArrowRight size={17} />
                  </Link>
                  <button className="button outline" onClick={() => repeat(o)}>
                    <RotateCcw size={16} />
                    Repetir na sacola
                  </button>
                </div>
              </article>
            ))
          )}
          <p className="orders-support">
            <Clock3 size={16} />
            Precisa de ajuda com um pedido?{" "}
            <a href="tel:+551532281782">(15) 3228-1782</a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
