import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist/server',{recursive:true});
await mkdir('dist/.openai',{recursive:true});
await cp('public','dist/client',{recursive:true});
await cp('.openai/hosting.json','dist/.openai/hosting.json');
const worker = String.raw`const enc=new TextEncoder();
async function token(code){const hash=await crypto.subtle.digest('SHA-256',enc.encode('skyward-admin:'+code));return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function cookie(req,name){const raw=req.headers.get('cookie')||'';for(const part of raw.split(';')){const [k,...v]=part.trim().split('=');if(k===name)return decodeURIComponent(v.join('='))}return ''}
function redirect(url,headers={}){return new Response(null,{status:302,headers:{Location:url,...headers}})}
export default {async fetch(req,env){const url=new URL(req.url),code=env.ADMIN_CODE;if(url.pathname==='/admin.html'){if(!code||cookie(req,'skyward_admin')!==await token(code))return redirect('/admin-login.html')}
if(url.pathname==='/api/admin/login'&&req.method==='POST'){if(!code)return new Response('ADMIN_CODE chưa được cấu hình.',{status:503});const data=await req.formData();if(String(data.get('code')||'')!==code)return redirect('/admin-login.html?error=1');return redirect('/admin.html',{'Set-Cookie':'skyward_admin='+await token(code)+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800'})}
if(url.pathname==='/api/admin/logout'&&req.method==='POST')return redirect('/admin-login.html',{'Set-Cookie':'skyward_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'});
return env.ASSETS.fetch(req)}};`;
await writeFile('dist/server/index.js',worker);
console.log('Built dist/client and dist/server/index.js');
