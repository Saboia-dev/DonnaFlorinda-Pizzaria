"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Store,
  LockKeyhole,
} from "lucide-react";
import { Header, Footer } from "../storefront";
import { useStore } from "../providers";
import { money, unitPrice, ADDRESS } from "@/lib/catalog";
import { rememberDemo, type DonnaOrder } from "../demo-orders";
export default function Checkout() {
  const {
    cart,
    setCart,
    setCartOpen,
    products,
    settings,
    loaded,
    error: catalogError,
  } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(1),
    [fulfillment, setFulfillment] = useState("delivery"),
    [consent, setConsent] = useState(false),
    [coupon, setCoupon] = useState(""),
    [applied, setApplied] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const key = useRef(""),
    lastPayload = useRef("");
  const formRef = useRef<HTMLFormElement>(null);
  const subtotal = cart.reduce(
    (s, i) => s + unitPrice(i, products) * i.quantity,
    0,
  );
  const discount =
    applied && applied === settings.coupon
      ? Math.round((subtotal * settings.discount) / 100)
      : 0;
  const delivery = fulfillment === "delivery" ? settings.deliveryFee : 0;
  const demo = !settings.ordersEnabled;
  function next() {
    const inputs = formRef.current?.querySelectorAll<HTMLInputElement>(
      "fieldset:not([hidden]) input",
    );
    for (const input of inputs || []) {
      if (!input.reportValidity()) return;
    }
    setError("");
    setStep(Math.min(3, step + 1));
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < 3) {
      next();
      return;
    }
    if (busy) return;
    setError("");
    if (!consent) {
      setError("Confirme os dados para continuar.");
      return;
    }
    const data = new FormData(e.currentTarget),
      value = (name: string) => String(data.get(name) || "").trim();
    const payload = {
      items: cart,
      customer: {
        name: value("name"),
        phone: value("phone"),
        email: value("email"),
      },
      fulfillment,
      address: {
        street: value("street"),
        number: value("number"),
        neighborhood: value("neighborhood"),
        complement: value("complement"),
        city: "Sorocaba",
        zip: value("zip"),
      },
      coupon: applied,
      consent: true,
      demo,
    };
    const fingerprint = JSON.stringify(payload);
    if (!key.current || fingerprint !== lastPayload.current) {
      key.current = crypto.randomUUID();
      lastPayload.current = fingerprint;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, requestKey: key.current }),
      });
      const json = (await r.json()) as {
        error?: string;
        id: string;
        order?: DonnaOrder;
        checkoutUrl?: string;
      };
      if (!r.ok) throw Error(json.error);
      if (json.order) rememberDemo(json.order);
      if (json.checkoutUrl) {
        setCart([]);
        window.location.assign(json.checkoutUrl);
        return;
      }
      setCart([]);
      router.push(`/pagamento?pedido=${json.id}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível enviar. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="inner-shell">
      <Header />
      <main id="conteudo" className="inner-page checkout-page">
        <div className="checkout-heading">
          <Link href="/cardapio" className="breadcrumb">
            <ArrowLeft size={15} />
            VOLTAR AO CARDÁPIO
          </Link>
          <p className="eyebrow red">SUA NOITE COMEÇA COM UMA BOA ESCOLHA</p>
          <h1>
            Falta pouco
            <br />
            para <em>ficar perfeito.</em>
          </h1>
          <p>Seu pedido, com o mesmo cuidado de cada fatia.</p>
        </div>
        {!loaded ? (
          <p role="status">Carregando sua sacola…</p>
        ) : !cart.length ? (
          <div className="empty-state">
            <ShoppingBag size={48} />
            <h3>Vamos começar pelo sabor?</h3>
            <p>Sua sacola está vazia. Escolha uma pizza para continuar.</p>
            <Link className="button primary" href="/cardapio">
              Explorar cardápio
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <>
            {demo && (
              <div className="demo-strip">
                <ShieldCheck size={20} />
                <span>
                  <strong>Modo demonstração.</strong> Teste com dados fictícios.
                  Não há cobrança, preparo ou entrega.
                </span>
              </div>
            )}
            {catalogError && (
              <div role="alert" className="notice error">
                {catalogError}
              </div>
            )}
            <div className="checkout-progress" aria-label="Etapas do pedido">
              {["Seus dados", "Entrega ou retirada", "Pagamento"].map(
                (label, i) => (
                  <button
                    type="button"
                    disabled={i + 1 > step}
                    aria-current={step === i + 1 ? "step" : undefined}
                    onClick={() => setStep(i + 1)}
                    className={step >= i + 1 ? "active" : ""}
                    key={label}
                  >
                    <b>
                      {step > i + 1 ? (
                        <Check size={16} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </b>
                    <span>{label}</span>
                  </button>
                ),
              )}
            </div>
            <form
              ref={formRef}
              noValidate
              onSubmit={submit}
              className="checkout-grid"
            >
              <div className="checkout-fields">
                <fieldset hidden={step !== 1}>
                  <legend>01 / Para quem vai essa delícia?</legend>
                  <p>Os dados para cuidar do seu pedido.</p>
                  <div className="form-grid">
                    <label className="field-label span-2">
                      Nome completo
                      <input
                        name="name"
                        required
                        minLength={2}
                        maxLength={100}
                        autoComplete="name"
                        placeholder="Como podemos chamar você?"
                      />
                    </label>
                    <label className="field-label">
                      Telefone com DDD
                      <input
                        name="phone"
                        type="tel"
                        required
                        pattern="\(?[0-9]{2}\)?\s?[0-9]{4,5}[-\s]?[0-9]{4}"
                        maxLength={20}
                        autoComplete="tel"
                        placeholder="(15) 99999-9999"
                      />
                    </label>
                    <label className="field-label">
                      E-mail
                      <input
                        name="email"
                        type="email"
                        required
                        maxLength={180}
                        autoComplete="email"
                        placeholder="voce@exemplo.com"
                      />
                    </label>
                  </div>
                </fieldset>
                <fieldset hidden={step !== 2}>
                  <legend>02 / Onde será o encontro?</legend>
                  <p>Na sua casa ou com retirada na Donna.</p>
                  <div className="delivery-options">
                    {[
                      {
                        id: "delivery",
                        Icon: Truck,
                        title: "Receber em casa",
                        desc: `Sorocaba · ${money(settings.deliveryFee)}`,
                      },
                      {
                        id: "pickup",
                        Icon: Store,
                        title: "Retirar na Donna",
                        desc: "Sem taxa de entrega",
                      },
                    ].map(({ id, Icon, title, desc }) => (
                      <label
                        className={fulfillment === id ? "selected" : ""}
                        key={id}
                      >
                        <input
                          type="radio"
                          name="fulfillment"
                          value={id}
                          checked={fulfillment === id}
                          onChange={() => setFulfillment(id)}
                        />
                        <Icon size={24} />
                        <strong>{title}</strong>
                        <small>{desc}</small>
                      </label>
                    ))}
                  </div>
                  {fulfillment === "delivery" ? (
                    <div className="form-grid">
                      <label className="field-label">
                        CEP
                        <input
                          name="zip"
                          required
                          pattern="180[0-9]{2}-?[0-9]{3}"
                          autoComplete="postal-code"
                          placeholder="18090-070"
                        />
                      </label>
                      <label className="field-label">
                        Cidade
                        <input value="Sorocaba" readOnly />
                      </label>
                      <label className="field-label">
                        Rua
                        <input
                          name="street"
                          required
                          maxLength={140}
                          autoComplete="address-line1"
                          placeholder="Nome da rua"
                        />
                      </label>
                      <label className="field-label">
                        Número
                        <input
                          name="number"
                          required
                          maxLength={20}
                          placeholder="Número ou s/n"
                        />
                      </label>
                      <label className="field-label">
                        Bairro
                        <input name="neighborhood" required maxLength={100} />
                      </label>
                      <label className="field-label">
                        Complemento (opcional)
                        <input name="complement" maxLength={100} />
                      </label>
                    </div>
                  ) : (
                    <div className="pickup-address">
                      <Store size={26} />
                      <div>
                        <strong>Sua pizza espera por você aqui.</strong>
                        <p>
                          {ADDRESS}
                          <br />
                          CEP 18090-070
                        </p>
                      </div>
                    </div>
                  )}
                  <p className="small muted">
                    {demo
                      ? "Taxa e prazo de entrega demonstrativos."
                      : "A disponibilidade de entrega depende da área atendida pela pizzaria."}
                  </p>
                </fieldset>
                <fieldset hidden={step !== 3}>
                  <legend>03 / A última etapa.</legend>
                  <p>Revise sua escolha e continue com segurança.</p>
                  <div className="payment-choice">
                    <ShieldCheck size={36} />
                    <div>
                      <h2>
                        {demo
                          ? "Experimente sem cobrança."
                          : "Checkout Mercado Pago"}
                      </h2>
                      <p>
                        {demo
                          ? "Você vai receber uma confirmação de teste e poderá consultar o pedido neste navegador."
                          : "Você será direcionado ao ambiente do Mercado Pago para escolher entre as formas disponíveis, como Pix e cartão."}
                      </p>
                    </div>
                  </div>
                  <div className="payment-badges">
                    <span>
                      <LockKeyhole size={16} />
                      Dados protegidos
                    </span>
                    <span>
                      <Check size={16} />
                      {demo
                        ? "Sem dados bancários"
                        : "Confirmação pelo provedor"}
                    </span>
                  </div>
                  <label className="check-label consent-line">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span>
                      Confirmo os dados e li a{" "}
                      <Link
                        href="/privacidade"
                        target="_blank"
                        className="underlined-inline"
                      >
                        política de privacidade
                      </Link>
                      .
                      {demo &&
                        " Entendo que é uma demonstração sem cobrança ou entrega."}
                    </span>
                  </label>
                </fieldset>
                {error && (
                  <div role="alert" className="notice error">
                    {error}
                  </div>
                )}
                <div className="checkout-navigation">
                  {step > 1 && (
                    <button
                      type="button"
                      className="button outline"
                      onClick={() => setStep(step - 1)}
                    >
                      <ArrowLeft size={17} />
                      Voltar
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      className="button primary grow"
                      onClick={next}
                    >
                      Continuar
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      className="button primary grow"
                      disabled={busy || !settings.open || !!catalogError}
                      type="submit"
                    >
                      {busy
                        ? "Preparando seu pedido…"
                        : !settings.open
                          ? "Pedidos pausados"
                          : demo
                            ? "Concluir demonstração"
                            : "Ir para pagamento seguro"}
                      <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
              <aside className="checkout-summary">
                <span className="eyebrow red">BOAS ESCOLHAS</span>
                <h2>
                  Uma noite
                  <br />
                  <em>com a sua cara.</em>
                </h2>
                {cart.map((item, i) => {
                  const p = products.find((p) => p.id === item.id);
                  return (
                    <div className="checkout-item" key={i}>
                      <Image
                        src={p?.image || "/assets/pizza.png"}
                        alt={p?.name || "Pizza"}
                        width={74}
                        height={74}
                      />
                      <div>
                        <strong>
                          {item.quantity}× {p?.name}
                          {item.halfId &&
                            ` + ${products.find((p) => p.id === item.halfId)?.name}`}
                        </strong>
                        <small>
                          {item.size === "grande"
                            ? "Grande · 8 fatias"
                            : "Broto · 4 fatias"}
                          {item.note && ` · ${item.note}`}
                        </small>
                        <span>
                          {money(unitPrice(item, products) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="text-button small"
                  onClick={() => setCartOpen(true)}
                >
                  Editar minha sacola
                </button>
                <div className="coupon-row">
                  <input
                    aria-label="Cupom de desconto"
                    placeholder="Tem um cupom?"
                    value={coupon}
                    maxLength={40}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (coupon && coupon === settings.coupon) {
                        setApplied(coupon);
                        setError("");
                      } else {
                        setError("Cupom inválido ou indisponível.");
                        setApplied("");
                      }
                    }}
                  >
                    Aplicar
                  </button>
                </div>
                <div className="summary-line row between">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className="summary-line row between">
                  <span>
                    {fulfillment === "delivery" ? "Entrega" : "Retirada"}
                  </span>
                  <span>{delivery ? money(delivery) : "Grátis"}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-line row between">
                    <span>Desconto</span>
                    <span>− {money(discount)}</span>
                  </div>
                )}
                <div className="summary-total row between">
                  <span>Total</span>
                  <span>{money(subtotal - discount + delivery)}</span>
                </div>
                <p className="summary-caption">
                  {demo
                    ? "Demonstração · nenhuma cobrança será feita"
                    : "O total é validado no servidor antes do pagamento."}
                </p>
              </aside>
            </form>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
