// Compatibilidade para a versão hospedada na Vercel.
// O acesso ao D1 é feito no servidor pela API oficial do Cloudflare em lib/server.ts.
export {db as getDb} from '@/lib/server';
