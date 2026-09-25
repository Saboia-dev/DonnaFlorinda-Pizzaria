import catalogProducts from './products.json';
export type Product={id:string;name:string;description:string;category:string;price:number;individualPrice?:number|null;image?:string;available:boolean;tag:string;vegetarian:boolean};
export type CartItem={id:string;halfId?:string;size:'individual'|'grande';quantity:number;note:string};
export type StoreSettings={open:boolean;deliveryFee:number;deliveryMinutes:string;coupon:string;discount:number;ordersEnabled:boolean};
export const initialSettings:StoreSettings={open:true,deliveryFee:800,deliveryMinutes:'45–60 min',coupon:'',discount:0,ordersEnabled:false};
export const seedProducts:Product[]=catalogProducts;
export const MENU_SOURCE='https://loja.neemo.com.br/donnaflorindapizzariaartesanal';
export const MENU_DATE='25/09/2026';
export const money=(v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v/100);
// O cardápio oficial cobra a MÉDIA dos dois sabores, não o maior preço.
export function unitPrice(item:CartItem,products:Product[]){
 const p=products.find(p=>p.id===item.id); const half=products.find(p=>p.id===item.halfId);
 if(!p)return 0;
 if(p.category==='Bebidas')return p.price;
 if(item.size==='individual')return p.individualPrice??p.price;
 return half?Math.round((p.price+half.price)/2):p.price;
}
export const ADDRESS='R. Nicolau Alonso Filho, 151 — Jardim Santa Rosália, Sorocaba – SP';
