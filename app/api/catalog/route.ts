import {catalog,json,failure,paymentsReady,owner,databaseConfigured} from '@/lib/server';
export async function GET(request:Request){try{const [c,who]=await Promise.all([catalog(),owner(request)]);return json({...c,paymentsReady:paymentsReady(),storage:databaseConfigured()?'server':'browser'},200,who.cookie?{'Set-Cookie':who.cookie}:{});}catch(e){return failure(e);}}
