import Link from "next/link";
import { Header, Footer } from "./storefront";
export default function NotFound() {
  return (
    <div className="inner-shell">
      <Header />
      <main id="conteudo" className="inner-page">
        <div className="empty-state">
          <span className="eyebrow red">404 / ESSA FATIA NÃO ESTÁ AQUI</span>
          <h1 className="display-sm">Vamos voltar para a mesa?</h1>
          <p>
            O endereço pode ter mudado. Seu próximo sabor continua no cardápio.
          </p>
          <Link href="/cardapio" className="button primary">
            Ver cardápio
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
