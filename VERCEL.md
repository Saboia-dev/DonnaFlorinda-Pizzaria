# Publicar na Vercel

## 1. Projeto Next.js

Suba os arquivos desta pasta para seu repositório. `package.json` precisa estar na raiz selecionada na Vercel.

- Framework preset: Next.js.
- Install command: `npm ci`.
- Build command: `npm run build`.
- Output directory: mantenha o padrão do Next.js; não use `dist`.
- Node: 22.x ou 24.x.

O build gera `.next/routes-manifest.json`. Não envie `node_modules`, `.next` ou `.env.local` ao GitHub. O ZIP traz `package-lock.json`; use npm.

Sem variáveis, todas as páginas e o checkout demonstrativo funcionam. Dados do pedido local ficam apenas no navegador e podem ser apagados ao limpar os dados do site.

## 2. Banco para operação persistente

Para continuar com a integração já existente do projeto, crie um banco Cloudflare D1 e execute o conteúdo de `drizzle/0000_nebulous_silver_sable.sql` uma única vez. Em banco existente, preserve as tabelas e os pedidos.

Configure no ambiente da Vercel:

- `CF_ACCOUNT_ID`
- `CF_D1_DATABASE_ID`
- `CF_D1_API_TOKEN`: token com acesso ao banco pretendido.

Não coloque essas credenciais em variáveis `NEXT_PUBLIC_`. Faça novo deploy após alterar o ambiente.

## 3. Painel administrativo

Configure:

- `ADMIN_PASSWORD`: senha exclusiva, de pelo menos 12 caracteres.
- `ADMIN_SESSION_SECRET`: segredo aleatório de pelo menos 32 caracteres.

Abra `/admin`, entre e revise o cardápio, taxa, prazo e disponibilidade. Sem banco, o painel informa que a persistência precisa ser configurada. Não há senha padrão. A sessão expira em 8 horas.

## 4. Mercado Pago

Na conta comercial responsável pela pizzaria, configure a integração e as credenciais apropriadas ao ambiente de teste ou produção:

- `MP_ACCESS_TOKEN`
- `MP_WEBHOOK_SECRET`
- `SITE_URL`: URL HTTPS canônica, como `https://seu-dominio.com.br`.

O endpoint de notificações é `https://seu-dominio.com.br/api/payment/webhook`, para eventos de pagamento. Configure a assinatura no painel do provedor; a aplicação valida `x-signature` e consulta o pagamento diretamente na API antes de alterar o status. Os valores são recalculados no servidor.

As URLs de retorno levam a `/pagamento?pedido=...`; essa tela consulta o status salvo e não considera o redirecionamento como prova de pagamento. Não há formulário de cartão no projeto.

Use primeiro as contas/credenciais de teste do provedor e valide aprovação, recusa, pendência, notificação e reembolso no seu próprio ambiente. A entrega não contém credenciais e não inclui homologação de cobrança real.

## 5. Ativar vendas

Depois de configurar o banco, revisar preços/área de entrega e testar o provedor:

1. Defina `ENABLE_LIVE_ORDERS=true` no servidor e faça novo deploy.
2. Em `/admin > Configurações`, ative vendas reais e salve.

Os dois passos e as credenciais são necessários. Se faltarem, a loja continua em demonstração. Não deixe pedidos reais ligados para uma demonstração pública.

A consulta de pedidos é vinculada a um cookie essencial do navegador; não há login de clientes ou sincronização entre dispositivos nesta versão. O histórico administrativo depende do banco.

## Documentação do provedor

https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/overview
https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/notifications/webhooks
