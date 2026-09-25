import {adminSession} from './admin-auth';
import {seedProducts,initialSettings,Product,StoreSettings} from './catalog';

type RuntimeEnv={
  ADMIN_EMAILS?:string;
  MP_WEBHOOK_SECRET?:string;
  MP_ACCESS_TOKEN?:string;
  SITE_URL?:string;
  CF_ACCOUNT_ID?:string;
  CF_D1_DATABASE_ID?:string;
  CF_D1_API_TOKEN?:string;
};

type QueryResult<T=Record<string,unknown>>={results:T[];success?:boolean;meta?:Record<string,unknown>};
type D1ApiResponse<T>={success?:boolean;errors?:Array<{message?:string}>;result?:QueryResult<T>[]};

export const runtime=():RuntimeEnv=>({
  ADMIN_EMAILS:process.env.ADMIN_EMAILS,
  MP_WEBHOOK_SECRET:process.env.MP_WEBHOOK_SECRET,
  MP_ACCESS_TOKEN:process.env.MP_ACCESS_TOKEN,
  SITE_URL:process.env.SITE_URL,
  CF_ACCOUNT_ID:process.env.CF_ACCOUNT_ID,
  CF_D1_DATABASE_ID:process.env.CF_D1_DATABASE_ID,
  CF_D1_API_TOKEN:process.env.CF_D1_API_TOKEN,
});

async function queryD1<T=Record<string,unknown>>(sql:string,params:unknown[]=[]):Promise<QueryResult<T>>{
  const e=runtime();
  if(!e.CF_ACCOUNT_ID||!e.CF_D1_DATABASE_ID||!e.CF_D1_API_TOKEN){
    throw new Error('Banco indisponível. Configure CF_ACCOUNT_ID, CF_D1_DATABASE_ID e CF_D1_API_TOKEN na Vercel.');
  }
  const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(e.CF_ACCOUNT_ID)}/d1/database/${encodeURIComponent(e.CF_D1_DATABASE_ID)}/query`,{
    method:'POST',
    headers:{Authorization:`Bearer ${e.CF_D1_API_TOKEN}`,'Content-Type':'application/json'},
    body:JSON.stringify({sql,params:params.map(v=>v==null?null:String(v))}),
    cache:'no-store',signal:AbortSignal.timeout(15000),
  });
  const payload=await response.json() as D1ApiResponse<T>;
  const result=payload.result?.[0];
  if(!response.ok||payload.success===false||!result||result.success===false){
    const message=payload.errors?.map(x=>x.message).filter(Boolean).join('; ')||`HTTP ${response.status}`;
    throw new Error(`Falha ao consultar o D1: ${message}`);
  }
  return {...result,results:result.results||[]};
}

class RemoteStatement{
  constructor(private sql:string,private params:unknown[]=[]){ }
  bind(...params:unknown[]){return new RemoteStatement(this.sql,params);}
  async all<T=Record<string,unknown>>(){return queryD1<T>(this.sql,this.params);}
  async first<T=Record<string,unknown>>(){const r=await queryD1<T>(this.sql,this.params);return r.results[0]??null;}
  async run(){return queryD1(this.sql,this.params);}
}
class RemoteD1{prepare(sql:string){return new RemoteStatement(sql);}}
const remoteDb=new RemoteD1();
export function db(){return remoteDb;}

export class ApiError extends Error{constructor(message:string,public status=400){super(message);}}
export function json(data:unknown,status=200,headers:Record<string,string>={}){return Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});}
export function failure(e:unknown){if(e instanceof ApiError)return json({error:e.message},e.status);console.error('Donna API request failed',e instanceof Error?e.message:'unknown');return json({error:'Não foi possível concluir agora. Seus dados foram preservados; tente novamente.'},503);}
export function sameOrigin(request:Request){
 const origin=request.headers.get('origin');
 const host=request.headers.get('host')||new URL(request.url).host;
 let supplied:URL;try{supplied=new URL(origin||'');}catch{throw new ApiError('Origem não autorizada.',403);}
 // Next pode usar localhost internamente; o Host é o destino efetivo do navegador.
 if(!['http:','https:'].includes(supplied.protocol)||supplied.host!==host||supplied.origin!==origin||request.headers.get('sec-fetch-site')==='cross-site')throw new ApiError('Origem não autorizada.',403);
}
export async function body(request:Request){if(Number(request.headers.get('content-length')||0)>20000)throw new ApiError('Solicitação muito grande.',413);const raw=await request.text();if(raw.length>20000)throw new ApiError('Solicitação muito grande.',413);try{return JSON.parse(raw);}catch{throw new ApiError('Dados inválidos.');}}
export function databaseConfigured(){const e=runtime();return !!(e.CF_ACCOUNT_ID&&e.CF_D1_DATABASE_ID&&e.CF_D1_API_TOKEN);}
export function paymentsReady(){const e=runtime();return databaseConfigured()&&!!(e.MP_ACCESS_TOKEN&&e.MP_WEBHOOK_SECRET&&e.SITE_URL?.startsWith('https://'));}
export async function catalog(){if(!databaseConfigured())return {products:seedProducts,settings:initialSettings};const [p,s]=await Promise.all([db().prepare('SELECT data FROM products').all<{data:string}>(),db().prepare('SELECT data FROM settings WHERE id = ?').bind('store').first<{data:string}>()]);const overrides=new Map(p.results.map(x=>{const parsed=JSON.parse(x.data);return [parsed.id,parsed];}));const merged=seedProducts.map(p=>({...p,...(overrides.get(p.id)||{})}));for(const [id,p] of overrides)if(!seedProducts.some(x=>x.id===id))merged.push(p);return {products:merged as Product[],settings:{...initialSettings,...(s?JSON.parse(s.data):{}),ordersEnabled:!!(s&&JSON.parse(s.data).ordersEnabled&&paymentsReady()&&process.env.ENABLE_LIVE_ORDERS==='true')} as StoreSettings};}
export async function isAdmin(){return adminSession();}
export async function requireAdmin(){if(!await isAdmin())throw new ApiError('Acesso restrito ao administrador autorizado.',403);}
export async function owner(request:Request){const found=request.headers.get('cookie')?.match(/(?:^|;\s*)donna_guest=([a-f0-9-]{36})(?:;|$)/)?.[1];const id=found||crypto.randomUUID();return {id:`guest:${id}`,cookie:found?null:`donna_guest=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${new URL(request.url).protocol==='https:'?'; Secure':''}`};}
export async function ipHash(request:Request){const ip=request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local';return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
export async function mp(path:string,method='GET',data?:unknown,key?:string){const token=runtime().MP_ACCESS_TOKEN;if(!token)throw new ApiError('Pagamento online ainda não configurado.',503);const r=await fetch(`https://api.mercadopago.com${path}`,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',...(key?{'X-Idempotency-Key':key}:{})},signal:AbortSignal.timeout(15000),body:data?JSON.stringify(data):undefined});if(!r.ok)throw new ApiError('O provedor de pagamento não respondeu. Tente novamente em instantes.',502);return r.json() as Promise<any>;}
