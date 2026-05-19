import { supabase } from '../lib/supabase.js';
import { verificarAutenticacao } from '../lib/auth.js';
import { alertaErro, alertaSucesso, alertaAviso } from '../lib/alerts.js';
import { montarShell } from '../ui/layout.js';
import { heroicon, renderHeroicons } from '../ui/icons.js';
import { intervaloPagina, renderizarPaginacao } from '../ui/paginacao.js';

let paginaAtual = 1;
let modelos = [];

function limparFormulario() {
  document.querySelector('#modelo-id').value = '';
  document.querySelector('#modelo-nome').value = '';
  document.querySelector('#modelo-marca').value = '';
}

async function carregarMarcasSelect() {
  const { data, error } = await supabase.from('marcas').select('id, nome').order('nome');
  if (error) throw error;

  document.querySelector('#modelo-marca').innerHTML =
    '<option value="">Selecione</option>' + data.map((marca) => `<option value="${marca.id}">${marca.nome}</option>`).join('');
}

async function carregarModelos() {
  const { inicio, fim } = intervaloPagina(paginaAtual);
  const { data, count, error } = await supabase
    .from('modelos')
    .select('id, nome, marca_id, marcas(nome)', { count: 'exact' })
    .order('nome')
    .range(inicio, fim);

  if (error) throw error;
  modelos = data;

  document.querySelector('#tabela-modelos').innerHTML =
    data
      .map(
        (modelo) => `<tr>
          <td>${modelo.marcas?.nome || '-'}</td>
          <td class="font-semibold">${modelo.nome}</td>
          <td>
            <button class="btn-secondary" type="button" data-editar="${modelo.id}">
              ${heroicon('pencil')}Editar
            </button>
          </td>
        </tr>`,
      )
      .join('') || '<tr><td colspan="3" class="text-center text-slate-500">Não há modelos cadastrados.</td></tr>';

  document.querySelectorAll('[data-editar]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const modelo = modelos.find((item) => item.id === botao.dataset.editar);
      document.querySelector('#modelo-id').value = modelo.id;
      document.querySelector('#modelo-marca').value = modelo.marca_id;
      document.querySelector('#modelo-nome').value = modelo.nome;
      document.querySelector('#modelo-nome').focus();
    });
  });

  renderizarPaginacao(document.querySelector('#paginacao-modelos'), {
    paginaAtual,
    total: count,
    aoMudarPagina: async (pagina) => {
      paginaAtual = pagina;
      await carregarModelos();
    },
  });
}

async function salvarModelo(event) {
  event.preventDefault();

  const id = document.querySelector('#modelo-id').value;
  const marca_id = document.querySelector('#modelo-marca').value;
  const nome = document.querySelector('#modelo-nome').value.trim();

  if (!marca_id || !nome) {
    await alertaAviso('Preencha os campos obrigatórios', 'Selecione a marca e informe o nome do modelo.');
    return;
  }

  try {
    const payload = { marca_id, nome };
    const resposta = id ? await supabase.from('modelos').update(payload).eq('id', id) : await supabase.from('modelos').insert(payload);
    if (resposta.error) throw resposta.error;

    limparFormulario();
    await carregarModelos();
    await alertaSucesso('Modelo salvo', 'O cadastro foi atualizado com sucesso.');
  } catch (error) {
    alertaErro('Não foi possível salvar o modelo', error);
  }
}

async function iniciar() {
  try {
    const autenticacao = await verificarAutenticacao();
    if (!autenticacao) return;
    montarShell({ titulo: 'Modelos', descricao: 'Cadastre modelos vinculados às marcas.', perfil: autenticacao.perfil });
    document.querySelector('#form-modelo').addEventListener('submit', salvarModelo);
    document.querySelector('#limpar-modelo').addEventListener('click', limparFormulario);
    renderHeroicons();
    await carregarMarcasSelect();
    await carregarModelos();
  } catch (error) {
    alertaErro('Falha ao carregar modelos', error);
  }
}

iniciar();
