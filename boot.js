(async()=>{
const n=11;
const parts=[];
for(let i=0;i<n;i++){
  const t=await fetch('./p'+i+'.txt').then(r=>{if(!r.ok)throw new Error('missing p'+i+'.txt');return r.text();});
  parts.push(t.trim());
}
const bin=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
(0,eval)(new TextDecoder().decode(bin));
})().catch(e=>{console.error(e);const p=document.createElement('pre');p.style.cssText='color:#ffb0b8;padding:20px';p.textContent='Vortoria load error: '+e;document.body.appendChild(p);});
