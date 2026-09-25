import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Leaf, Heart, Flame } from "lucide-react";
import { Header, Footer } from "../storefront";
import { Reveal, CraftJourney } from "../scroll-experience";
export const metadata = { title: "Nossa essência | Donna Florinda" };
export default function EssencePage() {
  return (
    <div className="inner-shell">
      <Header />
      <main id="conteudo">
        <section className="editorial-hero essence-hero-v3">
          <div>
            <p className="eyebrow">SOROCABA / PIZZARIA ARTESANAL</p>
            <h1>
              Tem coisas
              <br />
              que só se fazem
              <br />
              <em>com alma.</em>
            </h1>
            <p>
              Uma massa. Bons ingredientes. Muitas histórias ao redor da mesa.
            </p>
            <a href="#historia" className="button light">
              Conheça o nosso jeito
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="essence-photo">
            <Image
              src="/assets/menu/margherita.jpg"
              alt="Pizza Marguerita do cardápio Donna Florinda"
              width={700}
              height={850}
              priority
            />
            <span>
              FEITA À MÃO.
              <br />
              <em>Lembrada pelo sabor.</em>
            </span>
          </div>
          <span className="editorial-word" aria-hidden="true">
            artigianale
          </span>
        </section>
        <section className="section essence-story" id="historia">
          <Reveal>
            <span className="eyebrow red">O QUE NOS TRAZ ATÉ A MESA</span>
            <h2>
              O simples,
              <br />
              feito <em>com cuidado.</em>
            </h2>
          </Reveal>
          <Reveal>
            <p className="lead">
              Uma pizza pode ser o motivo do encontro. A vontade de repetir faz
              o resto.
            </p>
            <p>
              A Donna Florinda é uma pizzaria artesanal no Jardim Santa Rosália,
              em Sorocaba. A massa de fermentação lenta e os ingredientes
              selecionados fazem parte da identidade da casa.
            </p>
            <p>
              Entre sabores tradicionais e combinações especiais, cada pessoa
              encontra um jeito de viver a sua noite. Uma pizza dividida, uma
              conversa que continua, mais uma fatia.
            </p>
            <Link href="/sabores" className="underlined">
              Conheça nossos sabores
              <ArrowUpRight size={18} />
            </Link>
          </Reveal>
        </section>
        <section className="story-gallery">
          <Reveal className="story-large-photo">
            <Image
              src="/assets/menu/presunto-royale-burrata.jpg"
              alt="Presunto Royale e Burrata"
              width={1000}
              height={800}
            />
            <span>O detalhe faz a diferença.</span>
          </Reveal>
          <Reveal className="story-quote">
            <span className="eyebrow">IL NOSTRO MODO</span>
            <p>
              Uma boa pizza
              <br />
              deixa a mesa
              <br />
              <em>mais interessante.</em>
            </p>
            <span className="quote-flower" aria-hidden="true">
              ✳
            </span>
          </Reveal>
        </section>
        <CraftJourney />
        <section className="section essence-pillars">
          {[
            {
              Icon: Leaf,
              title: "Ingredientes com presença.",
              text: "Da base de tomate às finalizações, cada ingrediente participa do sabor.",
            },
            {
              Icon: Flame,
              title: "Um jeito artesanal.",
              text: "Massa de fermentação lenta e cuidado no preparo, da primeira etapa até sair do forno.",
            },
            {
              Icon: Heart,
              title: "Feita para compartilhar.",
              text: "Escolha dois sabores, junte boas companhias e aproveite o seu momento.",
            },
          ].map(({ Icon, title, text }) => (
            <Reveal key={title}>
              <Icon size={32} />
              <h2>{title}</h2>
              <p>{text}</p>
            </Reveal>
          ))}
        </section>
        <section className="manifesto">
          <p className="eyebrow">A GENTE PREPARA. VOCÊ VIVE.</p>
          <h2>
            O próximo encontro
            <br />
            tem <em>sabor de Donna.</em>
          </h2>
          <Link className="button light" href="/visite">
            Venha nos conhecer
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
