import{v as f,s as u}from"./auth-QZ7grxCN.js";import{b as g}from"./icons-DUaS2wMO.js";import{m as h,f as _}from"./layout-BtgD1Zbc.js";import{r as b,i as y}from"./paginacao-G185v-st.js";let e=1;async function m(){const{inicio:t,fim:r}=y(e),{data:d,count:l,error:n}=await u.from("movimentacoes").select("id, data_hora_entrada, veiculos(placa, tipo_cliente, marcas(nome), modelos(nome), clientes(nome))",{count:"exact"}).eq("status","aberta").order("data_hora_entrada",{ascending:!0}).range(t,r);if(n)throw n;const p=d.map(o=>{var s,i,c;const a=o.veiculos;return`<tr>
        <td class="font-semibold">${(a==null?void 0:a.placa)||"-"}</td>
        <td>${((s=a==null?void 0:a.marcas)==null?void 0:s.nome)||"-"}</td>
        <td>${((i=a==null?void 0:a.modelos)==null?void 0:i.nome)||"-"}</td>
        <td>${((c=a==null?void 0:a.clientes)==null?void 0:c.nome)||"Avulso"}</td>
        <td>${(a==null?void 0:a.tipo_cliente)==="mensalista"?"Mensalista":"Avulso"}</td>
        <td>${_(o.data_hora_entrada)}</td>
      </tr>`}).join("");document.querySelector("#tabela-patio").innerHTML=p||'<tr><td colspan="6" class="text-center text-slate-500">Não há veículos no pátio.</td></tr>',b(document.querySelector("#paginacao-patio"),{paginaAtual:e,total:l,aoMudarPagina:async o=>{e=o,await m()}})}async function $(){try{const t=await f();if(!t)return;const{perfil:r}=t;h({titulo:"Pátio",descricao:"Veículos com movimentação aberta no momento.",perfil:r}),await m()}catch(t){g("Falha ao carregar o pátio",t)}}$();
