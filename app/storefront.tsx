"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FlavorScroll, CraftJourney, Reveal } from "./scroll-experience";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Menu,
  Plus,
  Minus,
  Leaf,
  MapPin,
  Phone,
  Flame,
  Heart,
  Clock,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useStore } from "./providers";
import { money, unitPrice, Product, CartItem, ADDRESS } from "@/lib/catalog";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Donna Florinda, início">
      <span className="brand-mark">
        df<span>✳</span>
      </span>
      <span>
        Donna Florinda<small>PIZZARIA ARTESANAL</small>
      </span>
    </Link>
  );
}
export function Header() {
  const { cart, setCartOpen } = useStore();
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <Brand />
        <nav aria-label="Navegação principal">
          {[
            ["/sabores", "Os sabores"],
            ["/cardapio", "Cardápio"],
            ["/nossa-essencia", "Nossa essência"],
            ["/visite", "Visite a Donna"],
          ].map(([url, label]) => (
            <Link
              key={url}
              href={url}
              aria-current={pathname === url ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="orders-link" href="/pedidos">
            Meus pedidos
          </Link>
          <button
            className="bag-button"
            onClick={() => setCartOpen(true)}
            aria-label={`Abrir sacola com ${cart.reduce((a, b) => a + b.quantity, 0)} itens`}
          >
            <ShoppingBag size={18} />
            <span className="bag-label">Seu pedido</span>
            <b>{cart.reduce((a, b) => a + b.quantity, 0)}</b>
          </button>
          <button
            className="mobile-menu icon-button"
            onClick={() => setMenu(true)}
            aria-label="Abrir menu"
          >
            <Menu />
          </button>
        </div>
      </header>
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent className="donna-sheet">
          <SheetTitle>Buona sera.</SheetTitle>
          <SheetDescription>
            Encontre seu próximo sabor favorito.
          </SheetDescription>
          <div className="mobile-links">
            {[
              ["/", "Início"],
              ["/sabores", "Os sabores"],
              ["/cardapio", "Cardápio"],
              ["/nossa-essencia", "Nossa essência"],
              ["/visite", "Visite a Donna"],
              ["/pedidos", "Meus pedidos"],
            ].map(([url, label]) => (
              <a key={url} href={url} onClick={() => setMenu(false)}>
                {label}
                <ArrowUpRight />
              </a>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <CartDrawer />
    </>
  );
}
export function CartDrawer() {
  const { cart, setCart, cartOpen, setCartOpen, products } = useStore();
  const total = cart.reduce(
    (a, x) => a + unitPrice(x, products) * x.quantity,
    0,
  );
  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="donna-sheet cart-sheet">
        <SheetTitle className="display-sm">Uma ótima escolha.</SheetTitle>
        <SheetDescription>
          Seu próximo momento Donna começa aqui.
        </SheetDescription>
        {cart.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={40} />
            <h3>Sua sacola está esperando.</h3>
            <p>Escolha um sabor e deixe a noite mais gostosa.</p>
            <a
              className="button primary"
              href="/cardapio"
              onClick={() => setCartOpen(false)}
            >
              Explorar cardápio
              <ArrowRight size={18} />
            </a>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {cart.map((item, i) => {
                const p = products.find((p) => p.id === item.id);
                return (
                  <div className="cart-line" key={i}>
                    <div className="cart-line-top">
                      <h3>
                        {p?.name || "Produto indisponível"}
                        {item.halfId &&
                          ` + ${products.find((p) => p.id === item.halfId)?.name}`}
                      </h3>
                      <button
                        className="icon-button"
                        aria-label={`Remover ${p?.name}`}
                        onClick={() =>
                          setCart(cart.filter((_, idx) => idx !== i))
                        }
                      >
                        <X size={17} />
                      </button>
                    </div>
                    <p>
                      {p?.category === "Bebidas"
                        ? "Unidade"
                        : item.size === "grande"
                          ? "Grande · 8 fatias"
                          : "Broto · 4 fatias"}
                      {item.note && ` · ${item.note}`}
                    </p>
                    <div className="row between">
                      <div className="stepper">
                        <button
                          aria-label="Diminuir quantidade"
                          onClick={() =>
                            setCart(
                              cart.flatMap((x, idx) =>
                                idx !== i
                                  ? [x]
                                  : x.quantity > 1
                                    ? [{ ...x, quantity: x.quantity - 1 }]
                                    : [],
                              ),
                            )
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          aria-label="Aumentar quantidade"
                          disabled={item.quantity >= 20}
                          onClick={() =>
                            setCart(
                              cart.map((x, idx) =>
                                idx === i
                                  ? { ...x, quantity: x.quantity + 1 }
                                  : x,
                              ),
                            )
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <strong>
                        {money(unitPrice(item, products) * item.quantity)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="cart-bottom">
              <div className="row between">
                <span>Subtotal</span>
                <strong>{money(total)}</strong>
              </div>
              <p>Entrega e descontos calculados no checkout.</p>
              <Link
                href="/checkout"
                className="button primary full"
                onClick={() => setCartOpen(false)}
              >
                Continuar meu pedido
                <ArrowRight size={18} />
              </Link>
              <button
                className="text-button full"
                onClick={() => setCartOpen(false)}
              >
                Escolher mais sabores
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <Brand />
        <p>
          Feita à mão.
          <br />
          Lembrada pelo sabor.
        </p>
        <a
          href="https://www.instagram.com/donnaflorindapizzaria/"
          target="_blank"
          rel="noreferrer"
        >
          Instagram <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Donna Florinda · Sorocaba, SP</span>
        <div>
          <Link href="/cardapio">Cardápio</Link>
          <Link href="/pagamento">Pagamento</Link>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/admin">Área administrativa</Link>
        </div>
      </div>
    </footer>
  );
}
export function ProductDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { products, add } = useStore();
  const [size, setSize] = useState<"individual" | "grande">("grande"),
    [halfId, setHalf] = useState("none"),
    [quantity, setQuantity] = useState(1),
    [note, setNote] = useState("");
  useEffect(() => {
    setSize("grande");
    setHalf("none");
    setQuantity(1);
    setNote("");
  }, [product?.id]);
  const item: CartItem = {
    id: product?.id || "",
    size,
    quantity,
    note,
    halfId: halfId === "none" ? undefined : halfId,
  };
  return (
    <Dialog open={!!product} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="product-dialog">
        <DialogTitle className="display-sm">{product?.name}</DialogTitle>
        <DialogDescription>{product?.description}</DialogDescription>
        {product && (
          <>
            {product.image && (
              <div className="dialog-photo">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={700}
                  height={400}
                />
              </div>
            )}
            <span className="eyebrow red">{product.tag}</span>
            {product.category !== "Bebidas" && (
              <>
                <label className="field-label">Qual é a sua fome?</label>
                <RadioGroup
                  value={size}
                  onValueChange={(v) => {
                    setSize(v as any);
                    if (v === "individual") setHalf("none");
                  }}
                  className="size-options"
                >
                  <label>
                    <RadioGroupItem
                      value="individual"
                      disabled={!product.individualPrice}
                    />
                    Broto{" "}
                    <small>
                      {product.individualPrice
                        ? money(product.individualPrice)
                        : "Indisponível"}{" "}
                      · 4 fatias
                    </small>
                  </label>
                  <label>
                    <RadioGroupItem value="grande" />
                    Grande <small>8 fatias</small>
                  </label>
                </RadioGroup>
                {size === "grande" && (
                  <label className="field-label">
                    Dois sabores, uma pizza
                    <Select value={halfId} onValueChange={setHalf}>
                      <SelectTrigger className="form-select">
                        <SelectValue placeholder="Um sabor só" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Um sabor só</SelectItem>
                        {products
                          .filter(
                            (p) =>
                              p.id !== product.id &&
                              p.available &&
                              p.category !== "Bebidas" &&
                              (product.category === "Doces"
                                ? p.category === "Doces"
                                : p.category !== "Doces"),
                          )
                          .map((p) => (
                            <SelectItem value={p.id} key={p.id}>
                              ½ {p.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <small>
                      Na pizza meio a meio, o valor é a média dos dois sabores.
                    </small>
                  </label>
                )}
              </>
            )}
            <label className="field-label">
              Algum detalhe especial?
              <textarea
                maxLength={200}
                rows={2}
                placeholder="Ex.: sem cebola"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <p className="muted small">
              Contém glúten e pode conter leite. Em caso de alergias, fale com a
              pizzaria antes de pedir.
            </p>
            <div className="row">
              <div className="stepper">
                <button
                  disabled={quantity === 1}
                  aria-label="Diminuir"
                  onClick={() => setQuantity(quantity - 1)}
                >
                  <Minus size={16} />
                </button>
                <span>{quantity}</span>
                <button
                  disabled={quantity === 20}
                  aria-label="Aumentar"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                className="button primary grow"
                disabled={!product.available}
                onClick={() => {
                  add(item);
                  onClose();
                }}
              >
                Adicionar · {money(unitPrice(item, products) * quantity)}
                <Plus size={18} />
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
const slides = [
  {
    kicker: "01 / O SABOR DE ESTAR JUNTO",
    title: (
      <>
        A noite pede
        <br />
        <em>Donna.</em>
      </>
    ),
    text: "A melhor Pizzaria Artesanal de Sorocaba. Ingredientes selecionados, mãos que cuidam e sabor que aproxima.",
  },
  {
    kicker: "02 / SIMPLES. EXTRAORDINÁRIA.",
    title: (
      <>
        O clássico.
        <br />
        <em>Reinventado.</em>
      </>
    ),
    text: "Tomate, mozzarella e manjericão. Quando cada ingrediente importa, o simples se torna inesquecível.",
  },
  {
    kicker: "03 / À MESA, SEM PRESSA",
    title: (
      <>
        Bons encontros.
        <br />
        <em>Boas fatias.</em>
      </>
    ),
    text: "Escolha seu sabor, chame sua companhia favorita e deixe o resto com a Donna.",
  },
];
export default function Storefront() {
  const { products, settings, error } = useStore();
  const [slide, setSlide] = useState(0),
    [pause, setPause] = useState(false),
    [category, setCategory] = useState("Todos"),
    [selected, setSelected] = useState<Product | null>(null);
  const scene = useRef<HTMLElement>(null);
  const carousel = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);
  useEffect(() => {
    if (pause || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [pause]);
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    let frame = 0;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    function update() {
      frame = 0;
      const r = el!.getBoundingClientRect();
      const p = Math.min(
        1,
        Math.max(0, -r.top / (r.height - window.innerHeight)),
      );
      el!.style.setProperty("--progress", String(reduced ? 0 : p));
      el!.classList.toggle("scene-reading", p > 0.35);
    }
    function scroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <>
      <Header />
      <main id="conteudo">
        <section ref={scene} className="cinema-scene">
          <div className="scene-sticky">
            <div className="grain" />
            <div className="orbital orbital-one" />
            <div className="orbital orbital-two" />
            <div
              className="hero-copy"
              onMouseEnter={() => setPause(true)}
              onMouseLeave={() => setPause(false)}
              onFocus={() => setPause(true)}
              onBlur={() => setPause(false)}
            >
              <div className="hero-slide" key={slide}>
                <p className="eyebrow">{slides[slide].kicker}</p>
                <h1>{slides[slide].title}</h1>
                <p className="hero-description">{slides[slide].text}</p>
                <a className="button primary" href="#cardapio">
                  Escolha sua pizza
                  <ArrowUpRight size={19} />
                </a>
              </div>
            </div>
            <div className="hero-side-note">
              <span>PIZZARIA</span>
              <span>ARTESANAL</span>
              <i>Feita com alma.</i>
            </div>
            <div className="pizza-stage">
              <img
                className="hero-pizza"
                src="/assets/pizza.png"
                alt="Pizza artesanal Margherita com mozzarella e manjericão"
                width="1254"
                height="1254"
                fetchPriority="high"
              />
              <div className="pizza-label">
                <span>LA VERA</span>
                <em>Margherita</em>
                <span>TOMATE · MOZZARELLA · MANJERICÃO</span>
              </div>
            </div>
            <div className="hero-detail">
              <p className="eyebrow">DA NOSSA COZINHA, COM AMOR</p>
              <h2>
                Não é só pizza.
                <br />É <em>Donna Florinda.</em>
              </h2>
              <p>
                A massa, o molho, o último toque de manjericão. Cada detalhe
                existe por um bom motivo: fazer você querer mais uma fatia.
              </p>
              <a className="button light" href="#cardapio">
                Encontre seu sabor
                <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="hero-bottom">
              <div className="slide-controls">
                <button
                  className="icon-button"
                  aria-label="Slide anterior"
                  onClick={() => setSlide((slide + 2) % 3)}
                >
                  <ChevronLeft size={18} />
                </button>
                <span>
                  0{slide + 1}
                  <i> / 03</i>
                </span>
                <button
                  className="icon-button"
                  aria-label="Próximo slide"
                  onClick={() => setSlide((slide + 1) % 3)}
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  className="text-button small"
                  onClick={() => setPause(!pause)}
                >
                  {pause ? "Reproduzir" : "Pausar"}
                </button>
              </div>
              <a className="scroll-hint" href="#essencia">
                ROLE PARA SENTIR O SABOR <ArrowDown size={16} />
              </a>
              <span className="hero-location">
                <MapPin size={14} />
                SOROCABA, SP
              </span>
            </div>
          </div>
        </section>
        <div className="marquee" aria-hidden="true">
          <div>
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i}>
                BUONA PIZZA <i>✳</i> BUONA VITA <i>✳</i> FEITA À MÃO <i>✳</i>
              </span>
            ))}
          </div>
        </div>
        <section className="essence section" id="essencia">
          <div>
            <p className="eyebrow red">A NOSSA ESSÊNCIA</p>
            <h2>
              O segredo está
              <br />
              no <em>cuidado.</em>
            </h2>
          </div>
          <div className="essence-body">
            <p className="lead">
              Uma boa pizza começa muito antes da primeira fatia.
            </p>
            <p>
              Na Donna Florinda, ingredientes frescos e selecionados encontram o
              cuidado de uma produção artesanal. Da base à cobertura, o sabor é
              o protagonista.
            </p>
            <div className="values">
              <div>
                <Flame />
                <h3>Artesanal de verdade</h3>
                <p>Feita com atenção em cada etapa.</p>
              </div>
              <div>
                <Leaf />
                <h3>Ingredientes frescos</h3>
                <p>Escolhidos para fazer a diferença.</p>
              </div>
              <div>
                <Heart />
                <h3>Feita para reunir</h3>
                <p>Uma boa mesa. Uma boa companhia.</p>
              </div>
            </div>
          </div>
        </section>
        <FlavorScroll onSelect={setSelected} />
        <section className="menu-section section" id="cardapio">
          <Reveal className="section-heading">
            <div>
              <p className="eyebrow red">ESCOLHA SEU PRÓXIMO FAVORITO</p>
              <h2>
                Amore à<br />
                <em>primeira fatia.</em>
              </h2>
            </div>
            <p>
              Dos clássicos que abraçam
              <br />
              às combinações que surpreendem.
            </p>
          </Reveal>
          {!settings.ordersEnabled && (
            <div className="catalog-notice">
              Seleção do cardápio oficial · valores sujeitos a atualização.
              Checkout em demonstração.{" "}
              <a
                href="https://deliveryapp.neemo.com.br/delivery/1601/menu"
                target="_blank"
                rel="noreferrer"
              >
                Consultar cardápio oficial <ArrowUpRight size={14} />
              </a>
            </div>
          )}
          {error && (
            <p role="alert" className="notice">
              {error}
            </p>
          )}
          <div className="featured-pizza">
            <div className="featured-art">
              <span className="art-ring">IL CLASSICO</span>
              <img
                src="/assets/pizza.png"
                alt="Margherita — imagem ilustrativa"
                loading="lazy"
                width="560"
                height="560"
              />
            </div>
            <div className="featured-copy">
              <span className="eyebrow red">UM CLÁSSICO, MUITOS MOTIVOS</span>
              <h3>Marguerita.</h3>
              <p>
                Tomate que traz intensidade. Mozzarella que derrete. Manjericão
                que perfuma. A Itália em uma combinação que nunca sai de cena.
              </p>
              <div className="row">
                <span className="price">
                  {money(
                    products.find((p) => p.id === "margherita")?.price ?? 7700,
                  )}
                  <small>grande · 8 fatias</small>
                </span>
                <button
                  className="button dark"
                  disabled={
                    !products.find((p) => p.id === "margherita")?.available
                  }
                  onClick={() =>
                    setSelected(
                      products.find((p) => p.id === "margherita") || null,
                    )
                  }
                >
                  Quero essa
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="menu-tools">
            <div
              className="categories"
              role="group"
              aria-label="Categorias do cardápio"
            >
              {["Todos", "Clássicas", "Especiais", "Doces"].map((c) => (
                <button
                  key={c}
                  aria-pressed={category === c}
                  className={category === c ? "active" : ""}
                  onClick={() => {
                    setCategory(c);
                    setActiveCard(0);
                    carousel.current?.scrollTo({ left: 0 });
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="carousel-arrows">
              <button
                className="icon-button"
                aria-label="Sabores anteriores"
                onClick={() =>
                  carousel.current?.scrollBy({ left: -370, behavior: "smooth" })
                }
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="icon-button"
                aria-label="Mais sabores"
                onClick={() =>
                  carousel.current?.scrollBy({ left: 370, behavior: "smooth" })
                }
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div
            className="flavor-carousel"
            ref={carousel}
            onScroll={() =>
              setActiveCard(
                Math.round((carousel.current?.scrollLeft || 0) / 360),
              )
            }
          >
            {products
              .filter((p) => category === "Todos" || p.category === category)
              .slice(0, 12)
              .map((p, i) => (
                <article className={`flavor-card flavor-${i % 3}`} key={p.id}>
                  <div className="row between">
                    <span className="eyebrow">{p.category}</span>
                    <span className="flavor-number">0{i + 1}</span>
                  </div>
                  <div>
                    <span className="flavor-tag">{p.tag}</span>
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                  </div>
                  <div className="flavor-footer">
                    <div>
                      <strong>{money(p.price)}</strong>
                      <small>
                        {p.category === "Bebidas"
                          ? "unidade"
                          : "grande · 8 fatias"}
                        {p.vegetarian &&
                          p.category !== "Bebidas" &&
                          " · vegetariana"}
                      </small>
                    </div>
                    <button
                      className="round-button"
                      disabled={!p.available}
                      onClick={() => setSelected(p)}
                      aria-label={`Escolher ${p.name}`}
                    >
                      {p.available ? <Plus size={22} /> : <X size={22} />}
                    </button>
                  </div>
                </article>
              ))}
          </div>
          <Link href="/cardapio" className="underlined">
            Ver todos os sabores
            <ArrowUpRight size={18} />
          </Link>
          <div className="carousel-track">
            <span style={{ left: `${Math.min(activeCard, 4) * 16}%` }} />
          </div>
        </section>
        <CraftJourney />
        <section className="manifesto">
          <span className="eyebrow">A VIDA ACONTECE EM VOLTA DA MESA</span>
          <h2>
            Menos pressa.
            <br />
            Mais <em>pizza.</em>
          </h2>
          <a className="button light" href="#cardapio">
            Hoje é dia de Donna
            <ArrowUpRight size={18} />
          </a>
          <span className="manifesto-script" aria-hidden="true">
            buon appetito!
          </span>
        </section>
        <section className="visit section" id="visite">
          <div>
            <p className="eyebrow red">SUA MESA ESTÁ AQUI</p>
            <h2>
              De Sorocaba.
              <br />
              <em>Para você.</em>
            </h2>
            <p className="lead">Venha viver a experiência Donna.</p>
            <p>
              Um encontro em nossas mesas externas ou uma noite tranquila em
              casa. Você escolhe o momento.
            </p>
          </div>
          <div className="visit-card">
            <div className="row">
              <MapPin />
              <span>JARDIM SANTA ROSÁLIA</span>
            </div>
            <h3>
              Um bom endereço
              <br />
              para boas noites.
            </h3>
            <p>
              {ADDRESS}
              <br />
              CEP 18090-070
            </p>
            <a
              className="underlined"
              href="https://www.google.com/maps/search/?api=1&query=Donna+Florinda+Rua+Nicolau+Alonso+Filho+151+Sorocaba"
              target="_blank"
              rel="noreferrer"
            >
              Como chegar
              <ArrowUpRight size={18} />
            </a>
            <div className="visit-contact">
              <a href="tel:+551532281782">
                <Phone size={18} />
                (15) 3228-1782
              </a>
              <span>
                <Clock size={18} />
                Consulte os horários por telefone
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </>
  );
}
