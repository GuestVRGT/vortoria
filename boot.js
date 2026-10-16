(async()=>{
  const n=6;
  const parts=[];
  for(let i=0;i<n;i++){
    const t=await fetch('./p'+i+'.txt').then(r=>r.text());
    parts.push(t.trim());
  }
  const bin=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
  const code=new TextDecoder().decode(bin);
  (0,eval)(code);
})().catch(e=>{console.error(e);alert('Vortoria failed to load: '+e.message)});
