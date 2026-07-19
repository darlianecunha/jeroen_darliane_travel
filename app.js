// Galeria Jeroen & Darliane — lê uma lista de fotos e agrupa por país e local.
const COUNTRY_PT = { Netherlands:"Holanda", Belgium:"Bélgica", Germany:"Alemanha", Austria:"Áustria", Brazil:"Brasil", Portugal:"Portugal", Spain:"Espanha", Italy:"Itália", France:"França", "United Kingdom":"Reino Unido", England:"Inglaterra", Switzerland:"Suíça", Ireland:"Irlanda", "United States":"Estados Unidos", Denmark:"Dinamarca", Norway:"Noruega", Sweden:"Suécia", Greece:"Grécia", Poland:"Polônia", "Czech Republic":"República Tcheca", Hungary:"Hungria", Argentina:"Argentina", Other:"Outros" };
const COUNTRY_FLAG = { Netherlands:"🇳🇱", Belgium:"🇧🇪", Germany:"🇩🇪", Austria:"🇦🇹", Brazil:"🇧🇷", Portugal:"🇵🇹", Spain:"🇪🇸", Italy:"🇮🇹", France:"🇫🇷", "United Kingdom":"🇬🇧", England:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", Switzerland:"🇨🇭", Ireland:"🇮🇪", "United States":"🇺🇸", Denmark:"🇩🇰", Norway:"🇳🇴", Sweden:"🇸🇪", Greece:"🇬🇷", Poland:"🇵🇱", "Czech Republic":"🇨🇿", Hungary:"🇭🇺", Argentina:"🇦🇷", Other:"📍" };
const COUNTRY_ORDER = ["Netherlands","Belgium","Germany","Austria","Switzerland","France","Italy","Spain","Portugal","United Kingdom","England","Ireland","Brazil","Other"];
let flatPhotos = [];
function slugify(s){ return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
function countryRank(c){ const i=COUNTRY_ORDER.indexOf(c); return i===-1?COUNTRY_ORDER.length:i; }
fetch("gallery.json?v="+Date.now()).then(r=>r.json()).then(render).catch(e=>{ document.getElementById("gallery").innerHTML='<p class="loading">Não foi possível carregar as fotos.</p>'; console.error(e); });
function render(data){
  document.getElementById("year").textContent=new Date().getFullYear();
  const photos=data.photos||[];
  const byCountry={};
  photos.forEach(p=>{ const co=p.country||"Other", ci=p.city||"—"; (byCountry[co]=byCountry[co]||{}); (byCountry[co][ci]=byCountry[co][ci]||[]).push(p); });
  const countries=Object.keys(byCountry).sort((a,b)=>countryRank(a)-countryRank(b)||a.localeCompare(b));
  const totalPlaces=countries.reduce((n,c)=>n+Object.keys(byCountry[c]).length,0);
  document.getElementById("heroMeta").textContent=`${photos.length} fotos · ${totalPlaces} lugares`;
  document.getElementById("nav").innerHTML=countries.map(c=>`<a href="#c-${slugify(c)}">${COUNTRY_FLAG[c]||"📍"} ${COUNTRY_PT[c]||c}</a>`).join("");
  const gallery=document.getElementById("gallery"); gallery.innerHTML=""; flatPhotos=[];
  countries.forEach(country=>{
    const section=document.createElement("section"); section.className="country"; section.id="c-"+slugify(country);
    const cities=Object.keys(byCountry[country]).sort((a,b)=>a.localeCompare(b));
    const total=cities.reduce((n,c)=>n+byCountry[country][c].length,0);
    section.innerHTML=`<h2 class="country__title">${COUNTRY_FLAG[country]||"📍"} ${COUNTRY_PT[country]||country}<span class="place__count"> · ${total} fotos</span></h2><div class="country__rule"></div>`;
    cities.forEach(city=>{
      const list=byCountry[country][city];
      const place=document.createElement("div"); place.className="place";
      const head=document.createElement("div"); head.className="place__head";
      head.innerHTML=`<h3 class="place__name">${city}</h3><span class="place__count">${list.length} ${list.length===1?"foto":"fotos"}</span>`;
      place.appendChild(head);
      const grid=document.createElement("div"); grid.className="grid";
      list.forEach(p=>{
        const idx=flatPhotos.length;
        flatPhotos.push({file:p.file, caption:`${city}, ${COUNTRY_PT[country]||country}`});
        const item=document.createElement("div"); item.className="grid__item";
        item.innerHTML=`<img loading="lazy" src="${p.file}" alt="${city}, ${country}" />`;
        item.addEventListener("click",()=>openLightbox(idx));
        grid.appendChild(item);
      });
      place.appendChild(grid); section.appendChild(place);
    });
    gallery.appendChild(section);
  });
}
let current=0;
const lb=document.getElementById("lightbox"), lbImg=document.getElementById("lbImg"), lbCaption=document.getElementById("lbCaption");
function openLightbox(i){ current=i; showPhoto(); lb.classList.add("open"); lb.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; }
function closeLightbox(){ lb.classList.remove("open"); lb.setAttribute("aria-hidden","true"); document.body.style.overflow=""; }
function showPhoto(){ const p=flatPhotos[current]; lbImg.src=p.file; lbImg.alt=p.caption; lbCaption.textContent=`${p.caption} · ${current+1} / ${flatPhotos.length}`; }
function next(){ current=(current+1)%flatPhotos.length; showPhoto(); }
function prev(){ current=(current-1+flatPhotos.length)%flatPhotos.length; showPhoto(); }
document.getElementById("lbClose").addEventListener("click",closeLightbox);
document.getElementById("lbNext").addEventListener("click",next);
document.getElementById("lbPrev").addEventListener("click",prev);
lb.addEventListener("click",e=>{ if(e.target===lb) closeLightbox(); });
document.addEventListener("keydown",e=>{ if(!lb.classList.contains("open"))return; if(e.key==="Escape")closeLightbox(); if(e.key==="ArrowRight")next(); if(e.key==="ArrowLeft")prev(); });
