"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="inner-page">
      <div className="empty-state">
        <p className="eyebrow red">VAMOS TENTAR MAIS UMA VEZ</p>
        <h1 className="display-sm">Algo interrompeu sua visita.</h1>
        <p>Reabra a página para continuar seu pedido.</p>
        <button className="button primary" onClick={reset}>
          Tentar novamente
        </button>
        <a href="/">Voltar ao início</a>
      </div>
    </main>
  );
}
