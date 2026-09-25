"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import { useStore } from "./providers";
import { money, Product } from "@/lib/catalog";
export const flavorScenes = [
  {
    id: "margherita",
    image: "/assets/pizza.png",
    name: "Marguerita",
    subtitle: "A origem de tudo.",
    ingredients: ["Tomate", "Mozzarella", "Manjericão"],
    description:
      "Poucos ingredientes. Uma combinação que diz tudo. O frescor do manjericão encontra a mozzarella e o sabor do tomate.",
    color: "#24352b",
  },
  {
    id: "calabresa-coberta",
    image: "/assets/calabresa.png",
    name: "Calabresa",
    subtitle: "Personalidade em cada fatia.",
    ingredients: ["Calabresa", "Cebola roxa", "Orégano"],
    description:
      "Intensa, generosa e cheia de presença. Calabresa e cebola roxa se encontram em um daqueles sabores que sempre merecem uma segunda fatia.",
    color: "#512e24",
  },
  {
    id: "quatro-queijos",
    image: "/assets/quatro-queijos.png",
    name: "Quatro\nqueijos",
    subtitle: "Cremosidade sem pressa.",
    ingredients: ["Mussarela", "Gorgonzola", "Provolone"],
    description:
      "Uma mistura de queijos, texturas e intensidades. Uma pizza para saborear devagar e dividir com quem faz a noite valer a pena.",
    color: "#443b26",
  },
];
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("reveal-ready");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
export function FlavorScroll({ onSelect }: { onSelect: (p: Product) => void }) {
  const ref = useRef<HTMLElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const { products, settings } = useStore();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(1, -r.top / Math.max(1, r.height - innerHeight)),
      );
      const position = progress * 2;
      el.style.setProperty("--wheel-turn", `${position * 125}deg`);
      el.style.setProperty("--wheel-progress", String(progress));
      for (let i = 0; i < 3; i++) {
        const distance = Math.min(1, Math.abs(position - i));
        const opacity = 1 - distance;
        el.style.setProperty(`--flavor-${i}`, String(opacity));
        el.style.setProperty(`--shift-${i}`, `${(i - position) * 60}px`);
      }
      const next = Math.round(position);
      if (activeRef.current !== next) {
        activeRef.current = next;
        setActive(next);
      }
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request);
    media.addEventListener("change", request);
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", request);
      media.removeEventListener("change", request);
      cancelAnimationFrame(raf);
    };
  }, []);
  function go(index: number) {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY;
    window.scrollTo({
      top: top + (el.offsetHeight - innerHeight) * (index / 2),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  return (
    <section
      className="flavor-story"
      ref={ref}
      id="sabores"
      aria-label="Viagem pelos sabores"
    >
      <div className="flavor-sticky">
        <div className="flavor-scene-backgrounds" aria-hidden="true">
          {flavorScenes.map((s, i) => (
            <div
              key={s.id}
              style={{
                background: s.color,
                opacity: `var(--flavor-${i},${i === 0 ? 1 : 0})`,
              }}
            />
          ))}
        </div>
        <div className="flavor-story-top">
          <span className="eyebrow">TRÊS SABORES. MUITAS HISTÓRIAS.</span>
          <span className="small">
            ROLE E DESCUBRA <ArrowDown size={15} />
          </span>
        </div>
        <div className="flavor-wheel" aria-hidden="true">
          {flavorScenes.map((s, i) => (
            <img
              key={s.id}
              src={s.image}
              alt=""
              width="1254"
              height="1254"
              loading="lazy"
              style={{
                opacity: `var(--flavor-${i},${i === 0 ? 1 : 0})`,
                transform: `rotate(calc(var(--wheel-turn,0deg) + ${i * 18}deg))`,
              }}
            />
          ))}
        </div>
        <div className="flavor-orbit" aria-hidden="true" />
        <span className="wheel-caption" aria-hidden="true">
          FATIA POR FATIA · FEITA À MÃO
        </span>
        <div className="flavor-stories">
          {flavorScenes.map((s, i) => {
            const product = products.find((p) => p.id === s.id);
            return (
              <article
                key={s.id}
                className={`flavor-chapter ${active === i ? "is-active" : ""}`}
                aria-hidden={active !== i}
                style={{
                  opacity: `var(--flavor-${i},${i === 0 ? 1 : 0})`,
                  transform: `translateY(var(--shift-${i},0px))`,
                }}
              >
                <span className="eyebrow">
                  0{i + 1} / 03 — {s.subtitle}
                </span>
                <h2>
                  {s.name.split("\n").map((part, n) => (
                    <span key={n}>{part}</span>
                  ))}
                </h2>
                <p>{s.description}</p>
                <div className="ingredient-chips">
                  {s.ingredients.map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </div>
                <div className="flavor-order-row">
                  <span>
                    {product ? money(product.price) : "—"}
                    <small>grande · 8 fatias</small>
                  </span>
                  <button
                    tabIndex={active === i ? 0 : -1}
                    className="button light"
                    disabled={!product?.available}
                    onClick={() => product && onSelect(product)}
                  >
                    Escolher esse sabor
                    <Plus size={18} />
                  </button>
                </div>
                {!settings.ordersEnabled && (
                  <small className="flavor-demo">
                    Imagem ilustrativa · checkout em demonstração
                  </small>
                )}
              </article>
            );
          })}
        </div>
        <div className="flavor-story-bottom">
          <div className="flavor-dots" aria-label="Selecionar sabor">
            {flavorScenes.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`Ver ${s.name.replace("\n", " ")}`}
                aria-pressed={active === i}
              >
                <span>0{i + 1}</span>
                <i />
              </button>
            ))}
          </div>
          <a href="/cardapio">
            Ver o cardápio completo
            <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="wheel-progress" aria-hidden="true">
          <i />
        </div>
      </div>
      <div className="flavors-reduced">
        {flavorScenes.map((s) => (
          <article key={s.id}>
            <img
              src={s.image}
              alt={`Pizza ${s.name.replace("\n", " ")} — imagem ilustrativa`}
              width="600"
              height="600"
              loading="lazy"
            />
            <h2>{s.name.replace("\n", " ")}</h2>
            <p>{s.description}</p>
            <button
              className="button primary"
              disabled={!products.find((p) => p.id === s.id)?.available}
              onClick={() => {
                const p = products.find((p) => p.id === s.id);
                if (p) onSelect(p);
              }}
            >
              Escolher sabor
              <Plus size={18} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
export function CraftJourney() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.max(
        0,
        Math.min(1, (innerHeight * 0.85 - r.top) / (r.height * 0.8)),
      );
      el.style.setProperty("--craft-progress", String(p));
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", request, { passive: true });
    return () => {
      removeEventListener("scroll", request);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section className="craft-journey section" ref={ref}>
      <Reveal>
        <p className="eyebrow red">DO PRIMEIRO INGREDIENTE AO ÚLTIMO PEDAÇO</p>
        <h2>
          O cuidado faz
          <br />
          <em>o sabor.</em>
        </h2>
      </Reveal>
      <div className="craft-steps">
        {[
          {
            title: "Tudo começa na escolha.",
            text: "Ingredientes frescos e selecionados. Uma base simples para um sabor cheio de personalidade.",
            word: "Escolher",
          },
          {
            title: "Mãos que fazem a diferença.",
            text: "Na produção artesanal, cada detalhe conta. É esse cuidado que dá identidade à nossa pizza.",
            word: "Preparar",
          },
          {
            title: "O melhor momento é junto.",
            text: "Uma mesa, boas conversas e uma pizza no centro. O resto da história é com você.",
            word: "Compartilhar",
          },
        ].map((step, i) => (
          <Reveal className="craft-step" key={step.word}>
            <span className="craft-step-number">0{i + 1}</span>
            <div>
              <span className="eyebrow">{step.word}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
