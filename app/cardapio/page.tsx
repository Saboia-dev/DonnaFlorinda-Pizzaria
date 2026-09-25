"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  Leaf,
  ArrowUpRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Header, Footer, ProductDialog } from "../storefront";
import { Reveal } from "../scroll-experience";
import { useStore } from "../providers";
import { money, Product, MENU_SOURCE, MENU_DATE } from "@/lib/catalog";
export default function MenuPage() {
  const { products, settings, error } = useStore();
  const [category, setCategory] = useState("Todos"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<Product | null>(null),
    [veggie, setVeggie] = useState(false),
    [sort, setSort] = useState("house"),
    [limit, setLimit] = useState(12);
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = useMemo(() => {
    const list = products.filter(
      (p) =>
        (category === "Todos" || p.category === category) &&
        (!veggie || p.vegetarian) &&
        normalize(`${p.name} ${p.description}`).includes(normalize(query)),
    );
    return sort === "price"
      ? list.sort((a, b) => a.price - b.price)
      : sort === "name"
        ? list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
        : list;
  }, [products, category, query, veggie, sort]);
  function reset() {
    setCategory("Todos");
    setQuery("");
    setVeggie(false);
    setSort("house");
    setLimit(12);
  }
  return (
    <div className="inner-shell">
      <Header />
      <main id="conteudo">
        <section className="menu-page-intro upgraded-menu-hero">
          <div>
            <Link href="/" className="breadcrumb">
              DONNA FLORINDA / CARDÁPIO
            </Link>
            <h1>
              O difícil é<br />
              <em>escolher uma só.</em>
            </h1>
            <p>
              Dos clássicos da casa às combinações que surpreendem. Sua próxima
              favorita está aqui.
            </p>
            <a href="#escolhas" className="button light">
              Encontrar meu sabor
              <ArrowUpRight size={18} />
            </a>
          </div>
          <img
            src="/assets/calabresa.png"
            alt="Pizza artesanal, imagem ilustrativa"
            width="700"
            height="700"
          />
          <span className="hero-stamp">
            FEITA À MÃO
            <br />
            <b>✳</b>
            <br />
            FEITA PARA DIVIDIR
          </span>
          <div className="hero-footnote">
            <span>{products.length} escolhas da Donna</span>
            <span>Grande · 8 fatias / Broto · 4 fatias</span>
            <span>Do seu jeito, sempre.</span>
          </div>
        </section>
        <section className="section menu-page-content" id="escolhas">
          <div className="catalog-notice">
            <span>
              Sabores consultados no cardápio oficial em {MENU_DATE}. Preços
              sujeitos a atualização.
              {!settings.ordersEnabled && " Pedidos em demonstração."}
            </span>
            <a href={MENU_SOURCE} target="_blank" rel="noreferrer">
              Consultar original
              <ArrowUpRight size={15} />
            </a>
          </div>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <div className="menu-control-panel">
            <div className="menu-page-controls">
              <div className="categories" aria-label="Filtrar categoria">
                {["Todos", "Clássicas", "Especiais", "Doces"].map((c) => (
                  <button
                    key={c}
                    aria-pressed={c === category}
                    className={c === category ? "active" : ""}
                    onClick={() => {
                      setCategory(c);
                      setLimit(12);
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <label className="menu-search">
                <Search size={18} />
                <input
                  placeholder="Um sabor, um ingrediente…"
                  aria-label="Buscar no cardápio"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setLimit(12);
                  }}
                />
                {query && (
                  <button
                    aria-label="Limpar busca"
                    onClick={() => setQuery("")}
                  >
                    <X size={16} />
                  </button>
                )}
              </label>
            </div>
            <div className="menu-secondary-controls">
              <button
                className={`diet-toggle ${veggie ? "selected" : ""}`}
                aria-pressed={veggie}
                onClick={() => {
                  setVeggie(!veggie);
                  setLimit(12);
                }}
              >
                <Leaf size={16} />
                Sem carne
              </button>
              <label>
                <SlidersHorizontal size={16} />
                <select
                  aria-label="Ordenar sabores"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="house">Escolhas da casa</option>
                  <option value="price">Menor preço</option>
                  <option value="name">Nome A–Z</option>
                </select>
              </label>
              <span aria-live="polite">
                {filtered.length} sabores encontrados
              </span>
            </div>
          </div>
          <div className="catalog-grid">
            {filtered.slice(0, limit).map((p) => (
              <Reveal className="catalog-product" key={p.id}>
                <button
                  className="catalog-photo-button"
                  onClick={() => setSelected(p)}
                  aria-label={`Ver detalhes de ${p.name}`}
                >
                  <Image
                    src={p.image || "/assets/pizza.png"}
                    alt={p.name}
                    width={640}
                    height={480}
                    sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 30vw"
                  />
                  <span className="photo-category">{p.category}</span>
                  <span className="photo-plus">
                    <Plus size={20} />
                  </span>
                </button>
                <div className="catalog-product-info">
                  <div className="row between">
                    <span className="eyebrow red">{p.tag}</span>
                    {p.vegetarian && <Leaf size={17} aria-label="Sem carne" />}
                  </div>
                  <h2>{p.name}</h2>
                  <p>{p.description}</p>
                  <div className="row between">
                    <div className="price">
                      {money(p.price)}
                      <small>grande · 8 fatias</small>
                    </div>
                    <button
                      className="round-button"
                      aria-label={`Escolher ${p.name}`}
                      disabled={!p.available}
                      onClick={() => setSelected(p)}
                    >
                      <Plus size={22} />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {!filtered.length && (
            <div className="empty-state">
              <Search size={36} />
              <h3>Esse sabor ainda não apareceu.</h3>
              <p>Experimente outro ingrediente ou limpe os filtros.</p>
              <button className="button primary" onClick={reset}>
                Ver todos os sabores
              </button>
            </div>
          )}
          {filtered.length > limit && (
            <div className="load-more">
              <p>
                Você viu {Math.min(limit, filtered.length)} de {filtered.length}{" "}
                sabores.
              </p>
              <button
                className="button outline"
                onClick={() => setLimit(limit + 12)}
              >
                Mais motivos para pedir
                <Plus size={18} />
              </button>
            </div>
          )}
        </section>
        <section className="half-banner section">
          <div>
            <span className="eyebrow">DUAS ESCOLHAS. UMA BOA IDEIA.</span>
            <h2>
              Metade sua.
              <br />
              <em>Metade de quem vem.</em>
            </h2>
            <p>
              Na grande, combine dois sabores. O preço é a média das duas
              escolhas.
            </p>
          </div>
          <Link href="/sabores#monte" className="button light">
            Montar meio a meio
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <Footer />
      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
