"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  ScanLine,
  RefreshCw,
  Clock3,
} from "lucide-react";
import { Header, Footer } from "../storefront";
import { fetchOrders, DonnaOrder } from "../demo-orders";
import { money } from "@/lib/catalog";
import { useStore } from "../providers";
export default function PaymentScreen({ orderId }: { orderId?: string }) {
  const { settings } = useStore();
  const [order, setOrder] = useState<DonnaOrder | null>(null),
    [loading, setLoading] = useState(!!orderId),
    [error, setError] = useState("");
  async function load() {
    if (!orderId) return;
    try {
      const all = await fetchOrders();
      const found = all.find((o) => o.id === orderId);
      if (!found)
        throw Error("Este pedido não foi encontrado neste navegador.");
      setOrder(found);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível consultar.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    if (!orderId) return;
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [orderId]);
  const approved = order?.payment === "approved";
  const demo = !!order?.demo;
  return (
    <div className="inner-shell">
      <Header />
      <main id="conteudo">
        <section className="payment-hero">
          <p className="eyebrow">DONNA FLORINDA / PAGAMENTO</p>
          <h1>
            {demo ? (
              <>
                Tudo certo
                <br />
                com o seu <em>teste.</em>
              </>
            ) : approved ? (
              <>
                Sua noite
                <br />
                está <em>confirmada.</em>
              </>
            ) : (
              <>
                O último passo.
                <br />
                <em>Com tranquilidade.</em>
              </>
            )}
          </h1>
          <p>
            {demo
              ? "Sua experiência de demonstração foi concluída. Nenhuma cobrança foi realizada."
              : approved
                ? "Pagamento aprovado pelo provedor. Acompanhe o preparo em Meus pedidos."
                : "O sabor você escolhe. Do pagamento, a gente cuida com atenção."}
          </p>
        </section>
        <section className="section payment-content">
          {loading ? (
            <div className="empty-state" role="status">
              <RefreshCw className="spin" />
              <h3>Conferindo seu pedido…</h3>
            </div>
          ) : error ? (
            <div className="empty-state">
              <h3>Não conseguimos consultar agora.</h3>
              <p role="alert">{error}</p>
              <button className="button primary" onClick={load}>
                Tentar novamente
                <RefreshCw size={18} />
              </button>
              <Link href="/pedidos">Consultar meus pedidos</Link>
            </div>
          ) : order ? (
            <div className="payment-receipt">
              <div className="receipt-seal">
                {demo || approved ? <Check size={38} /> : <Clock3 size={38} />}
              </div>
              <p className="eyebrow red">
                {demo
                  ? "DEMONSTRAÇÃO CONCLUÍDA"
                  : approved
                    ? "PAGAMENTO APROVADO"
                    : order.payment === "rejected"
                      ? "PAGAMENTO RECUSADO"
                      : "AGUARDANDO CONFIRMAÇÃO"}
              </p>
              <h2>Pedido #{order.id.slice(0, 8).toUpperCase()}</h2>
              <p>
                {demo
                  ? "Este pedido não será preparado ou entregue."
                  : approved
                    ? "Você pode acompanhar as próximas etapas abaixo."
                    : "O retorno do checkout, sozinho, não confirma o pagamento. O status será atualizado após a confirmação do provedor."}
              </p>
              <div className="receipt-lines">
                {order.data.lines.map((line, i) => (
                  <div className="row between" key={i}>
                    <span>
                      {line.quantity}× {line.name}
                    </span>
                    <strong>{money(line.quantity * line.price)}</strong>
                  </div>
                ))}
                <div className="row between">
                  <span>Entrega</span>
                  <strong>{money(order.data.delivery)}</strong>
                </div>
                {order.data.discount > 0 && (
                  <div className="row between">
                    <span>Desconto</span>
                    <strong>− {money(order.data.discount)}</strong>
                  </div>
                )}
                <div className="summary-total row between">
                  <span>{demo ? "Total simulado" : "Total"}</span>
                  <span>{money(order.total)}</span>
                </div>
              </div>
              <div className="receipt-actions">
                {!demo &&
                  !approved &&
                  order.payment === "pending" &&
                  order.data.checkoutUrl && (
                    <a className="button primary" href={order.data.checkoutUrl}>
                      Continuar pagamento
                      <ArrowRight size={18} />
                    </a>
                  )}
                <Link href="/pedidos" className="button primary">
                  Ver meus pedidos
                  <ArrowRight size={18} />
                </Link>
                <Link href="/cardapio" className="button outline">
                  Voltar ao cardápio
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="section-heading">
                <div>
                  <p className="eyebrow red">DO PEDIDO À CONFIRMAÇÃO</p>
                  <h2>
                    Simples do
                    <br />
                    <em>começo ao fim.</em>
                  </h2>
                </div>
                <p>
                  Escolha sua pizza, confira os detalhes
                  <br />e conclua a sua noite Donna.
                </p>
              </div>
              <div className="payment-method-grid">
                {[
                  {
                    Icon: ScanLine,
                    title: "Pix",
                    text: "Quando habilitado na conta da pizzaria, o QR Code e o código de pagamento são gerados dentro do Mercado Pago.",
                  },
                  {
                    Icon: CreditCard,
                    title: "Cartão",
                    text: "Os dados do cartão são informados no ambiente do provedor. A Donna não solicita nem armazena esses dados.",
                  },
                  {
                    Icon: ShieldCheck,
                    title: "Confirmação",
                    text: "O status aparece em Meus pedidos após a confirmação do pagamento. Você pode voltar para consultar quando quiser.",
                  },
                ].map(({ Icon, title, text }) => (
                  <article key={title}>
                    <Icon size={32} />
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
              {!settings.ordersEnabled && (
                <div className="demo-strip">
                  <ShieldCheck size={23} />
                  <p>
                    A loja está em demonstração. O checkout pode ser testado sem
                    cobrança ou dados bancários.
                  </p>
                </div>
              )}
              <Link className="button primary" href="/checkout">
                Continuar meu pedido
                <ArrowRight size={18} />
              </Link>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
