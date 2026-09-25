# Donna Florinda v3

Continuação do ZIP Donna-Florinda-v2-Vercel-Fix, mantendo a página principal, paleta, tipografia e animações de scroll. O projeto usa Next.js 16, React 19 e TypeScript.

## Abrir no VS Code

1. Extraia o ZIP e abra a pasta que contém `package.json`.
2. Instale Node.js 22.13 ou superior (Node 24 também funciona).
3. Abra o terminal do VS Code e execute:

```bash
npm install
npm run dev
```

4. Acesse http://localhost:3000.

Não é preciso criar `.env.local` para testar. Sem credenciais, o modo é demonstração: não cobra, não envia pedidos à pizzaria e guarda somente o resumo do pedido neste navegador. Use dados fictícios no formulário.

## O que mudou

- 74 sabores reais encontrados no cardápio oficial, com fotos locais e preços de grande e broto.
- Cardápio com pesquisa por ingrediente/nome, categorias, filtro sem carne, ordenação e carregamento de mais resultados.
- Página de sabores com coleções e montador visual de duas metades.
- Meio a meio calcula a média dos preços, conforme a regra exibida no cardápio oficial. Broto permite um sabor.
- Páginas Nossa essência e Visite a Donna com composição editorial, fotos, animações, contato, rota e perguntas frequentes.
- Checkout em 3 etapas, entrega/retirada, cupom, edição da sacola, validação e resumo.
- Página de pagamento/confirmacão, histórico, atualização de status e repetição do pedido na sacola.
- API de demonstração funciona sem D1. Histórico local não persiste contato ou endereço.
- Painel administrativo com login próprio; remove a dependência de login ChatGPT no deploy da Vercel.
- Webhook Mercado Pago verifica assinatura e consulta o pagamento no servidor; nenhum status de aprovação é aceito pela URL de retorno.
- Páginas de erro e 404, acessibilidade, layouts móveis e respeito a movimento reduzido.

## Páginas

`/` · `/sabores` · `/cardapio` · `/nossa-essencia` · `/visite` · `/checkout` · `/pagamento` · `/pedidos` · `/privacidade` · `/admin`

## Testar

```bash
npm run build
npm run start
```

Com o servidor de demonstração aberto, outro terminal:

```bash
npm run test:checkout
```

O teste verifica as 10 páginas, catálogo, meio a meio, broto, retirada, validação de telefone/CEP, quantidade, cupom, bloqueio de origem, acesso administrativo e webhook sem assinatura. Ele deve rodar sem credenciais reais.

## Pagamento real

A interface e a integração com Checkout Pro estão implementadas. A cobrança REAL exige as credenciais da própria pizzaria, um banco persistente e a ativação explícita. Não foi feita nenhuma cobrança real nem validada uma conta comercial nesta entrega.

Veja `VERCEL.md` para configuração. Pix e cartão são oferecidos dentro do Mercado Pago conforme disponibilidade da conta, sem coletar cartão neste site.

## Arquivos principais

- `lib/products.json`: catálogo, fotos, preços de grande e broto.
- `lib/catalog.ts`: tipos e regra de preço.
- `app/premium.css`: estilos das páginas ampliadas.
- `app/storefront.tsx` e `app/scroll-experience.tsx`: página principal, navegação e cenas originais.
- `app/checkout/`, `app/pagamento/`, `app/pedidos/`: fluxo de compra.
- `app/api/`: catálogo, pedido, administração e webhook.
- `FONTES-DO-CARDAPIO.md`: origem e limites dos dados.

A taxa e o prazo de entrega iniciais são demonstrativos. O filtro sem carne é inferido pelos ingredientes; alergias, traços e preparo devem ser confirmados com a pizzaria. A versão não sincroniza automaticamente promoções e estoque do delivery oficial.
