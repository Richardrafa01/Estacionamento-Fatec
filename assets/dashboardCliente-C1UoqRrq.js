import{v as f,a as m,c as p,s as o}from"./auth-QZ7grxCN.js";import{b as h,h as b,r as v}from"./icons-DUaS2wMO.js";import{f as u,t as x}from"./layout-BtgD1Zbc.js";function g(e){document.querySelector("#page-header").innerHTML=`<header class="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between dark:border-slate-800">
    <div class="flex items-center gap-3">
      <img src="${m("/assets/logo.png")}" alt="Logotipo do Estacionamentos" class="h-10 w-10 object-contain" />
      <div>
        <h1 class="text-2xl font-bold">Área do cliente</h1>
        <p class="text-sm text-slate-600 dark:text-slate-300">Consulte seus veículos e movimentações.</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="text-right text-sm">
        <p class="font-semibold">${e.nome}</p>
        <p class="text-slate-500 dark:text-slate-400">Cliente</p>
      </div>
      <button id="botao-sair" class="btn-secondary" type="button">${b("arrow-left-on-rectangle")}Sair</button>
    </div>
  </header>`,document.querySelector("#botao-sair").addEventListener("click",async()=>{const{error:r}=await p();if(r)throw r;window.location.href=m("/login.html")}),v()}async function w(e){const{data:r,error:s}=await o.from("clientes").select("id").eq("user_id",e.user_id).single();if(s)throw s;const{data:i,error:c}=await o.from("veiculos").select("id, placa, ativo, marcas(nome), modelos(nome)").eq("cliente_id",r.id).order("placa");if(c)throw c;const n=i.map(t=>t.id);let d=[];if(n.length){const{data:t,error:a}=await o.from("movimentacoes").select("id, data_hora_entrada, data_hora_saida, status, veiculos(placa)").in("veiculo_id",n).order("data_hora_entrada",{ascending:!1}).limit(10);if(a)throw a;d=t}document.querySelector("#tabela-veiculos-cliente").innerHTML=i.map(t=>{var a,l;return`<tr>
          <td class="font-semibold">${t.placa}</td>
          <td>${((a=t.marcas)==null?void 0:a.nome)||"-"}</td>
          <td>${((l=t.modelos)==null?void 0:l.nome)||"-"}</td>
          <td>${t.ativo?"Ativo":"Inativo"}</td>
        </tr>`}).join("")||'<tr><td colspan="4" class="text-center text-slate-500">Não há veículos cadastrados.</td></tr>',document.querySelector("#tabela-historico-cliente").innerHTML=d.map(t=>{var a;return`<tr>
          <td class="font-semibold">${((a=t.veiculos)==null?void 0:a.placa)||"-"}</td>
          <td>${u(t.data_hora_entrada)}</td>
          <td>${u(t.data_hora_saida)}</td>
          <td>${x(t.status)}</td>
        </tr>`}).join("")||'<tr><td colspan="4" class="text-center text-slate-500">Não há movimentações para exibir.</td></tr>'}async function _(){try{const e=await f();if(!e)return;const{perfil:r}=e;g(r),await w(r)}catch(e){h("Falha ao carregar a área do cliente",e)}}_();
