import {cookies} from 'next/headers';
import {createHmac,timingSafeEqual} from 'node:crypto';
const sign=(value:string)=>createHmac('sha256',process.env.ADMIN_SESSION_SECRET||'').update(value).digest('hex');
export function validPassword(value:string){const expected=process.env.ADMIN_PASSWORD;if(!expected||expected.length<12||!process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_SESSION_SECRET.length<32)return false;return timingSafeEqual(Buffer.from(sign(value),'hex'),Buffer.from(sign(expected),'hex'));}
export function sessionToken(){const payload=String(Date.now()+8*60*60*1000);return `${payload}.${sign(payload)}`;}
export async function adminSession(){if(!process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_SESSION_SECRET.length<32)return false;const token=(await cookies()).get('donna_admin')?.value||'';const [expiry,signature]=token.split('.');return /^\d+$/.test(expiry||'')&&Number(expiry)>Date.now()&&Number(expiry)<Date.now()+9*60*60*1000&&/^[a-f0-9]{64}$/.test(signature||'')&&timingSafeEqual(Buffer.from(signature,'hex'),Buffer.from(sign(expiry),'hex'));}
