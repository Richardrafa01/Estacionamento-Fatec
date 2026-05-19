import{a,c}from"./auth-QZ7grxCN.js";import{h as s,b as d,r as m}from"./icons-DUaS2wMO.js";const h=[{href:"/pages/dashboard.html",texto:"Dashboard",icon:"chart-bar"},{href:"/pages/marcas.html",texto:"Marcas",icon:"tag"},{href:"/pages/modelos.html",texto:"Modelos",icon:"squares-2x2"},{href:"/pages/clientes.html",texto:"Clientes",icon:"users"},{href:"/pages/veiculos.html",texto:"Veículos",icon:"truck"},{href:"/pages/movimentacoes.html",texto:"Movimentações",icon:"clipboard-document-list"},{href:"/pages/patio.html",texto:"Pátio",icon:"truck"},{href:"/pages/historico.html",texto:"Histórico",icon:"calendar"}];function u(e){return e?new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(e)):"-"}function b(e){return e==null?"-":new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(e))}function x(e){return e==="aberta"?"Aberta":"Encerrada"}function g({titulo:e,descricao:n,perfil:r}){var o;const l=document.querySelector("#app-shell"),i=document.querySelector("#page-header");l.insertAdjacentHTML("afterbegin",`<aside class="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-5 lg:block dark:border-slate-800 dark:bg-slate-900">
      <div class="mb-8 flex items-center gap-3">
        <img src="${a("/assets/logo.png")}" alt="Logotipo do Estacionamentos" class="h-10 w-10 object-contain" />
        <strong class="text-lg">Estacionamentos</strong>
      </div>
      <nav class="space-y-1">
        ${h.map(t=>`<a href="${a(t.href)}" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">${s(t.icon)}${t.texto}</a>`).join("")}
      </nav>
    </aside>`),i.innerHTML=`<header class="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between dark:border-slate-800">
    <div>
      <h1 class="text-2xl font-bold">${e}</h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">${n}</p>
    </div>
    <div class="flex items-center gap-3">
      <div class="text-right text-sm">
        <p class="font-semibold">${r.nome}</p>
        <p class="text-slate-500 dark:text-slate-400">${r.tipo_usuario==="cliente"?"Cliente":"Proprietário"}</p>
      </div>
      <button id="botao-sair" class="btn-secondary" type="button">${s("arrow-left-on-rectangle")}Sair</button>
    </div>
  </header>`,(o=document.querySelector("#botao-sair"))==null||o.addEventListener("click",async()=>{try{const{error:t}=await c();if(t)throw t;window.location.href=a("/login.html")}catch(t){d("Não foi possível sair",t)}}),m()}export{b as a,u as f,g as m,x as t};
