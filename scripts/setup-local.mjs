import {copyFile,access} from 'node:fs/promises';
try{await access(new URL('../.env.local',import.meta.url));console.log('.env.local já existe; preservado.');}catch{await copyFile(new URL('../.env.example',import.meta.url),new URL('../.env.local',import.meta.url));console.log('.env.local criado. Nenhuma credencial é necessária para demonstração.');}
console.log('Execute npm run dev e abra http://localhost:3000.');
