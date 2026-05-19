function c(e){const t=(e-1)*10,a=t+10-1;return{inicio:t,fim:a}}function o(e){return Math.max(1,Math.ceil((e||0)/10))}function d(e,{paginaAtual:t,total:a,aoMudarPagina:n}){var i,r;const s=o(a);e.innerHTML=`<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-slate-600 dark:text-slate-300">Página ${t} de ${s} • ${a||0} registro(s)</p>
    <div class="flex gap-2">
      <button class="btn-secondary" type="button" data-pagina="anterior" ${t<=1?"disabled":""}>Anterior</button>
      <button class="btn-secondary" type="button" data-pagina="proxima" ${t>=s?"disabled":""}>Próxima</button>
    </div>
  </div>`,(i=e.querySelector('[data-pagina="anterior"]'))==null||i.addEventListener("click",()=>n(t-1)),(r=e.querySelector('[data-pagina="proxima"]'))==null||r.addEventListener("click",()=>n(t+1))}export{c as i,d as r};
