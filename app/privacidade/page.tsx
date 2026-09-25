import { Header, Footer } from "../storefront";
export default function Privacy() {
  return (
    <div className="inner-shell">
      <Header />
      <main className="inner-page prose" id="conteudo">
        <div className="page-heading">
          <p className="eyebrow red">TRANSPARÊNCIA À MESA</p>
          <h1>Seus dados.</h1>
        </div>
        <h2>Uma experiência de demonstração</h2>
        <p>
          Enquanto a loja estiver identificada como demonstração, os pedidos não
          são enviados à cozinha; sabores e preços foram consultados no cardápio
          oficial, e as condições devem ser confirmadas com a pizzaria. Os
          pedidos de teste não geram cobrança, preparo ou entrega. Recomendamos
          utilizar dados fictícios nos testes.
        </p>
        <h2>Dados do pedido</h2>
        <p>
          O checkout solicita nome, telefone, e-mail e, na entrega, endereço. No
          modo local sem banco configurado, os dados de contato e endereço são
          usados para validar o formulário e não são persistidos. Com o banco
          ativo, o pedido e esses dados são armazenados no servidor e podem ser
          acessados pelos administradores autorizados. Não informe dados
          sensíveis nas observações.
        </p>
        <h2>Armazenamento no navegador</h2>
        <p>
          A sacola é salva neste navegador para você continuar sua escolha. Os
          pedidos de demonstração local, sem dados de contato ou endereço,
          também ficam neste navegador. Limpar os dados do navegador apaga esse
          histórico. Quando o banco está configurado, um cookie essencial
          identifica o histórico de pedidos desse navegador. Não usamos cookies
          de publicidade nesta versão.
        </p>
        <h2>Pagamentos</h2>
        <p>
          Quando o pagamento real estiver habilitado, ele será realizado na
          página segura do Mercado Pago. Este site não recebe nem armazena
          número de cartão, código de segurança ou senha bancária. A confirmação
          depende da resposta do provedor.
        </p>
        <h2>Contato, exclusão e cancelamentos</h2>
        <p>
          Para dúvidas sobre seus dados, correções, exclusão de dados de teste
          ou cancelamentos, entre em contato pelo telefone (15) 3228-1782.
          Pedidos já em preparo exigem avaliação da pizzaria. Para excluir
          demonstrações locais, limpe os dados deste site nas configurações do
          navegador.
        </p>
      </main>
      <Footer />
    </div>
  );
}
