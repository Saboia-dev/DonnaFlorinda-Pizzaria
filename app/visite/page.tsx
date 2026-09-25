import Image from "next/image";
import {
  MapPin,
  Phone,
  ArrowUpRight,
  ShoppingBag,
  Clock3,
  Store,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { Header, Footer } from "../storefront";
import { Reveal } from "../scroll-experience";
import { ADDRESS, MENU_SOURCE } from "@/lib/catalog";
export const metadata = { title: "Visite a Donna | Sorocaba" };
const maps =
  "https://www.google.com/maps/search/?api=1&query=Donna+Florinda+Rua+Nicolau+Alonso+Filho+151+Sorocaba";
export default function VisitPage() {
  return (
    <div className="inner-shell">
      <Header />
      <main id="conteudo">
        <section className="editorial-hero visit-hero visit-hero-v3">
          <Image
            className="visit-background"
            src="/assets/menu/donna-florinda.jpg"
            alt="Pizza Donna Florinda"
            fill
            sizes="100vw"
            priority
          />
          <div>
            <p className="eyebrow">JARDIM SANTA ROSÁLIA · SOROCABA</p>
            <h1>
              Um bom lugar
              <br />
              para <em>ficar mais.</em>
            </h1>
            <p>
              Sua companhia favorita. Uma noite sem pressa. E a Donna no centro
              de tudo.
            </p>
            <a
              className="button light"
              href={maps}
              target="_blank"
              rel="noreferrer"
            >
              Encontre a Donna
              <MapPin size={18} />
            </a>
          </div>
        </section>
        <section className="visit-ribbon">
          <span>
            <MapPin size={19} />
            Santa Rosália, Sorocaba
          </span>
          <a href="tel:+551532281782">
            <Phone size={19} />
            (15) 3228-1782
          </a>
          <span>
            <Clock3 size={19} />
            Confirme os horários com a equipe
          </span>
        </section>
        <section className="section visit-page-grid">
          <Reveal className="visit-page-address">
            <MapPin size={30} />
            <h2>
              Um endereço.
              <br />
              <em>Muitos encontros.</em>
            </h2>
            <p>
              {ADDRESS}
              <br />
              CEP 18090-070
            </p>
            <a
              className="button primary"
              href={maps}
              target="_blank"
              rel="noreferrer"
            >
              Traçar minha rota
              <ArrowUpRight size={18} />
            </a>
            <a href="tel:+551532281782" className="underlined">
              Conversar com a equipe
              <Phone size={17} />
            </a>
          </Reveal>
          <Reveal className="visit-page-details">
            <article>
              <span className="eyebrow red">FALE COM A GENTE</span>
              <a href="tel:+551532281782" className="contact-large">
                (15) 3228-1782
              </a>
              <p>
                Confirme os horários do dia, mesas disponíveis e informações
                sobre seu pedido.
              </p>
            </article>
            <article>
              <span className="eyebrow red">PLANEJE SEU ENCONTRO</span>
              <h3>Mais uma pessoa à mesa?</h3>
              <p>
                Para reservas e grupos, fale diretamente com a equipe. A
                confirmação é feita pela pizzaria.
              </p>
              <a className="underlined" href="tel:+551532281782">
                Consultar uma reserva
                <ArrowUpRight size={18} />
              </a>
            </article>
            <article>
              <span className="eyebrow red">OS BASTIDORES DA DONNA</span>
              <a
                className="underlined"
                href="https://www.instagram.com/donnaflorindapizzaria/"
                target="_blank"
                rel="noreferrer"
              >
                @donnaflorindapizzaria
                <ArrowUpRight size={18} />
              </a>
            </article>
          </Reveal>
        </section>
        <section className="visit-ways section">
          <Reveal>
            <p className="eyebrow red">ESCOLHA O SEU MOMENTO</p>
            <h2>
              A Donna vai
              <br />
              <em>com a sua noite.</em>
            </h2>
          </Reveal>
          <div>
            {[
              {
                Icon: Store,
                title: "Na nossa casa.",
                text: "Venha conhecer a pizzaria no Jardim Santa Rosália. Confirme a disponibilidade de mesas com a equipe.",
                href: "tel:+551532281782",
                cta: "Falar com a Donna",
              },
              {
                Icon: ShoppingBag,
                title: "No seu caminho.",
                text: "Escolha sua pizza e combine a retirada. Um bom sabor para levar para casa.",
                href: "/cardapio",
                cta: "Escolher minha pizza",
              },
              {
                Icon: Truck,
                title: "Na sua casa.",
                text: "Para um pedido real, consulte a área atendida e as condições no delivery oficial.",
                href: MENU_SOURCE,
                cta: "Consultar delivery oficial",
              },
            ].map(({ Icon, title, text, href, cta }) => (
              <Reveal className="visit-way" key={title}>
                <Icon size={30} />
                <h3>{title}</h3>
                <p>{text}</p>
                <a
                  className="underlined"
                  href={href}
                  target={href.startsWith("https") ? "_blank" : undefined}
                  rel={href.startsWith("https") ? "noreferrer" : undefined}
                >
                  {cta}
                  <ArrowUpRight size={17} />
                </a>
              </Reveal>
            ))}
          </div>
        </section>
        <section className="section visit-faq">
          <Reveal>
            <p className="eyebrow red">ANTES DO SEU ENCONTRO</p>
            <h2>
              Uma dúvida?
              <br />
              <em>A gente ajuda.</em>
            </h2>
          </Reveal>
          <div>
            {[
              {
                q: "Como consultar os horários?",
                a: "Ligue para (15) 3228-1782 para confirmar o funcionamento do dia, inclusive em feriados.",
              },
              {
                q: "Posso escolher dois sabores?",
                a: "Sim. A pizza grande permite até dois sabores, com valor calculado pela média. A broto tem quatro pedaços e um sabor.",
              },
              {
                q: "Existem opções sem carne?",
                a: "Sim. Use o filtro “Sem carne” no cardápio. Em caso de alergias ou restrições alimentares, confirme os ingredientes e o preparo com a equipe.",
              },
              {
                q: "A reserva é confirmada pelo site?",
                a: "A reserva deve ser combinada diretamente com a pizzaria. Os botões de contato abrem o telefone, sem confirmar uma mesa automaticamente.",
              },
              {
                q: "Posso testar um pedido?",
                a: "Sim. Enquanto o checkout indicar modo demonstração, você pode testar usando dados fictícios, sem cobrança ou entrega. Para comprar agora, use o delivery oficial.",
              },
            ].map((x) => (
              <details key={x.q}>
                <summary>
                  {x.q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{x.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
