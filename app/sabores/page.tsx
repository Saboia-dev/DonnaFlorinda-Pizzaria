"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus, Heart, Leaf, Flame } from "lucide-react";
import { Header, Footer, ProductDialog } from "../storefront";
import { FlavorScroll, Reveal } from "../scroll-experience";
import { Product, money, unitPrice } from "@/lib/catalog";
import { useStore } from "../providers";
export default function FlavorsPage() {
  const { products, add, setCartOpen } = useStore();
  const [selected, setSelected] = useState<Product | null>(null),
    [first, setFirst] = useState("margherita"),
    [second, setSecond] = useState("calabresa-coberta");
  const a = products.find((p) => p.id === first),
    b = products.find((p) => p.id === second);
  const item = {
    id: first,
    halfId: second,
    size: "grande" as const,
    quantity: 1,
    note: "",
  };
  const groups = [
    {
      title: "Clássicas que abraçam.",
      text: "As combinações que sempre têm lugar à mesa.",
      Icon: Heart,
      ids: ["margherita", "calabresa-coberta", "portuguesa"],
    },
    {
      title: "O toque da casa.",
      text: "Ingredientes e texturas para uma noite especial.",
      Icon: Flame,
      ids: ["donna-florinda", "do-tio", "presunto-royale-burrata"],
    },
    {
      title: "Um final doce.",
      text: "Guarde uma fatia para a melhor parte.",
      Icon: Leaf,
      ids: ["nutella-com-leite-ninho", "prestigio", "brigadeiro"],
    },
  ];
  return (
    <div className="flavors-page">
      <Header />
      <main id="conteudo">
        <h1 className="sr-only">Os sabores da Donna Florinda</h1>
        <FlavorScroll onSelect={setSelected} />
        <section className="section flavor-collections">
          <Reveal>
            <p className="eyebrow red">CADA SABOR TEM SEU MOMENTO</p>
            <h2>
              Uma Donna.
              <br />
              <em>Muitas vontades.</em>
            </h2>
          </Reveal>
          {groups.map(({ title, text, Icon, ids }) => (
            <div className="flavor-collection" key={title}>
              <Reveal className="collection-heading">
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
              <div className="mini-flavor-grid">
                {ids.map((id) => {
                  const p = products.find((p) => p.id === id);
                  return p ? (
                    <button
                      className="mini-flavor"
                      key={id}
                      onClick={() => setSelected(p)}
                    >
                      <Image
                        src={p.image || "/assets/pizza.png"}
                        alt={p.name}
                        width={400}
                        height={300}
                      />
                      <span>
                        {p.name}
                        <Plus size={17} />
                      </span>
                      <small>{money(p.price)} · grande</small>
                    </button>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </section>
        <section className="section half-builder" id="monte">
          <div className="half-visual">
            <div className="half-circle">
              <Image
                className="half-left"
                src={a?.image || "/assets/pizza.png"}
                alt={`Metade ${a?.name}`}
                width={600}
                height={600}
              />
              <Image
                className="half-right"
                src={b?.image || "/assets/calabresa.png"}
                alt={`Metade ${b?.name}`}
                width={600}
                height={600}
              />
            </div>
            <span>BOAS ESCOLHAS SE COMPLETAM</span>
          </div>
          <div>
            <p className="eyebrow red">DO SEU JEITO</p>
            <h2>
              Por que escolher
              <br />
              <em>um só?</em>
            </h2>
            <p>
              Monte uma pizza grande com os dois sabores que combinam com a sua
              noite.
            </p>
            <div className="half-selects">
              <label className="field-label">
                Primeira metade
                <select
                  value={first}
                  onChange={(e) => {
                    setFirst(e.target.value);
                    const p = products.find((x) => x.id === e.target.value);
                    if ((p?.category === "Doces") !== (b?.category === "Doces"))
                      setSecond(
                        products.find(
                          (x) =>
                            x.id !== p?.id &&
                            (x.category === "Doces") ===
                              (p?.category === "Doces"),
                        )?.id || e.target.value,
                      );
                  }}
                >
                  {products
                    .filter((p) => p.available && p.category !== "Bebidas")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="field-label">
                Segunda metade
                <select
                  value={second}
                  onChange={(e) => setSecond(e.target.value)}
                >
                  {products
                    .filter(
                      (p) =>
                        p.available &&
                        p.category !== "Bebidas" &&
                        (p.category === "Doces") === (a?.category === "Doces"),
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <p className="small muted">
              8 fatias · valor pela média dos sabores · imagens do cardápio
            </p>
            <button
              className="button primary"
              disabled={!a?.available || !b?.available}
              onClick={() => {
                add(item);
                setCartOpen(true);
              }}
            >
              Adicionar · {money(unitPrice(item, products))}
              <Plus size={18} />
            </button>
          </div>
        </section>
        <section className="flavors-outro section">
          <p className="eyebrow red">E TEM MUITO MAIS</p>
          <h2>
            Seu próximo favorito
            <br />
            <em>está no cardápio.</em>
          </h2>
          <Link className="button primary" href="/cardapio">
            Explorar todos os sabores
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <Footer />
      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
