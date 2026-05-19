import{v as b,s as f}from"./auth-QZ7grxCN.js";import{b as g,h as p}from"./icons-DUaS2wMO.js";import{m as v,f as w,t as _}from"./layout-BtgD1Zbc.js";function x(){const t=new Date;t.setHours(0,0,0,0);const a=new Date;return a.setHours(23,59,59,999),{inicio:t.toISOString(),fim:a.toISOString()}}async function i(t,a){let r=f.from(t).select("id",{count:"exact",head:!0});a.forEach(([d,s,l])=>{r=r[s](d,l)});const{count:o,error:n}=await r;if(n)throw n;return o||0}function c({titulo:t,valor:a,icon:r,cor:o}){return`<article class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-slate-600 dark:text-slate-300">${t}</p>
        <strong class="mt-2 block text-3xl font-bold">${a}</strong>
      </div>
      <div class="rounded-lg ${o} p-3 text-white">${p(r,"h-6 w-6")}</div>
    </div>
  </article>`}async function S(){const{inicio:t,fim:a}=x(),[r,o,n,d,s]=await Promise.all([i("movimentacoes",[["status","eq","aberta"]]),i("clientes",[["ativo","eq",!0]]),i("movimentacoes",[["data_hora_entrada","gte",t],["data_hora_entrada","lte",a]]),i("movimentacoes",[["data_hora_saida","gte",t],["data_hora_saida","lte",a]]),f.from("movimentacoes").select("id, data_hora_entrada, status, veiculos(placa, marcas(nome), modelos(nome))").order("data_hora_entrada",{ascending:!1}).limit(5)]);if(s.error)throw s.error;document.querySelector("#cards-resumo").innerHTML=[c({titulo:"Veículos no pátio",valor:r,icon:"truck",cor:"bg-purple-600"}),c({titulo:"Mensalistas ativos",valor:o,icon:"users",cor:"bg-green-600"}),c({titulo:"Entradas hoje",valor:n,icon:"arrow-down-circle",cor:"bg-blue-600"}),c({titulo:"Saídas hoje",valor:d,icon:"arrow-up-circle",cor:"bg-amber-500"})].join("");const l=s.data.map(m=>{var u,h;const e=m.veiculos;return`<tr>
        <td class="font-semibold">${(e==null?void 0:e.placa)||"-"}</td>
        <td>${((u=e==null?void 0:e.marcas)==null?void 0:u.nome)||"-"} ${((h=e==null?void 0:e.modelos)==null?void 0:h.nome)||""}</td>
        <td>${w(m.data_hora_entrada)}</td>
        <td>${_(m.status)}</td>
      </tr>`}).join("");document.querySelector("#tabela-recentes").innerHTML=l||'<tr><td colspan="4" class="text-center text-slate-500">Não há movimentações recentes.</td></tr>'}async function $(){try{const t=await b();if(!t)return;const{perfil:a}=t;v({titulo:"Dashboard",descricao:"Resumo operacional do estacionamento.",perfil:a}),await S()}catch(t){g("Falha ao carregar o dashboard",t)}}$();
