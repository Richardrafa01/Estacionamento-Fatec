import { supabase } from '../lib/supabase.js';
import { verificarAutenticacao } from '../lib/auth.js';
import { alertaErro, alertaSucesso, alertaAviso, confirmarAcao } from '../lib/alerts.js';
import { montarShell } from '../ui/layout.js';
import { heroicon, renderHeroicons } from '../ui/icons.js';
import { intervaloPagina, renderizarPaginacao } from '../ui/paginacao.js';

let paginaAtual = 1;
let clientes = [];

function limparFormulario() {
  document.querySelector('#cliente-id').value = '';
  document.querySelector('#cliente-nome').value = '';
  document.querySelector('#cliente-email').value = '';
  document.querySelector('#cliente-telefone').value = '';
}

async function carregarClientes() {
  const { inicio, fim } = intervaloPagina(paginaAtual);
  const { data, count, error } = await supabase
    .from('clientes')
    .select('id, nome, email, telefone, ativo', { count: 'exact' })
    .order('nome')
    .range(inicio, fim);

  if (error) throw error;
  clientes = data;

  document.querySelector('#tabela-clientes').innerHTML =
    data
      .map(
        (cliente) => `<tr>
          <td class="font-semibold">${cliente.nome}</td>
          <td>${cliente.email || '-'}</td>
          <td>${cliente.telefone || '-'}</td>
          <td>${cliente.ativo ? 'Ativo' : 'Inativo'}</td>
          <td>
            <div class="flex flex-wrap gap-2">
              <button class="btn-secondary" type="button" data-editar="${cliente.id}">${heroicon('pencil')}Editar</button>
              <button class="${cliente.ativo ? 'btn-danger' : 'btn-success'}" type="button" data-status="${cliente.id}">
                ${heroicon(cliente.ativo ? 'power' : 'arrow-path')}${cliente.ativo ? 'Inativar' : 'Reativar'}
              </button>
            </div>
          </td>
        </tr>`,
      )
      .join('') || '<tr><td colspan="5" class="text-center text-slate-500">Não há clientes cadastrados.</td></tr>';

  document.querySelectorAll('[data-editar]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const cliente = clientes.find((item) => item.id === botao.dataset.editar);
      document.querySelector('#cliente-id').value = cliente.id;
      document.querySelector('#cliente-nome').value = cliente.nome;
      document.querySelector('#cliente-email').value = cliente.email || '';
      document.querySelector('#cliente-telefone').value = cliente.telefone || '';
      document.querySelector('#cliente-nome').focus();
    });
  });

  document.querySelectorAll('[data-status]').forEach((botao) => {
    botao.addEventListener('click', async () => {
      const cliente = clientes.find((item) => item.id === botao.dataset.status);
      const acao = cliente.ativo ? 'inativar' : 'reativar';
      const confirmado = await confirmarAcao(`${cliente.ativo ? 'Inativar' : 'Reativar'} cliente?`, `Deseja ${acao} ${cliente.nome}?`, 'Confirmar');
      if (!confirmado) return;

      try {
        const { error } = await supabase.from('clientes').update({ ativo: !cliente.ativo }).eq('id', cliente.id);
        if (error) throw error;
        await carregarClientes();
        await alertaSucesso('Cliente atualizado', 'A situação do cliente foi alterada.');
      } catch (error) {
        alertaErro('Não foi possível atualizar o cliente', error);
      }
    });
  });

  renderizarPaginacao(document.querySelector('#paginacao-clientes'), {
    paginaAtual,
    total: count,
    aoMudarPagina: async (pagina) => {
      paginaAtual = pagina;
      await carregarClientes();
    },
  });
}

async function salvarCliente(event) {
  event.preventDefault();

  const id = document.querySelector('#cliente-id').value;
  const nome = document.querySelector('#cliente-nome').value.trim();
  const email = document.querySelector('#cliente-email').value.trim() || null;
  const telefone = document.querySelector('#cliente-telefone').value.trim() || null;

  if (!nome) {
    await alertaAviso('Informe o nome', 'O nome do cliente é obrigatório.');
    return;
  }

  try {
    const payload = { nome, email, telefone, ativo: true };
    const resposta = id ? await supabase.from('clientes').update({ nome, email, telefone }).eq('id', id) : await supabase.from('clientes').insert(payload);
    if (resposta.error) throw resposta.error;

    limparFormulario();
    await carregarClientes();
    await alertaSucesso('Cliente salvo', 'O cadastro foi atualizado com sucesso.');
  } catch (error) {
    alertaErro('Não foi possível salvar o cliente', error);
  }
}

async function iniciar() {
  try {
    const autenticacao = await verificarAutenticacao();
    if (!autenticacao) return;
    montarShell({ titulo: 'Clientes', descricao: 'Cadastre clientes mensalistas e mantenha a situação atualizada.', perfil: autenticacao.perfil });
    document.querySelector('#form-cliente').addEventListener('submit', salvarCliente);
    document.querySelector('#limpar-cliente').addEventListener('click', limparFormulario);
    renderHeroicons();
    await carregarClientes();
  } catch (error) {
    alertaErro('Falha ao carregar clientes', error);
  }
}

iniciar();
