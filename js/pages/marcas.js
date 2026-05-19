import { supabase } from '../lib/supabase.js';
import { verificarAutenticacao } from '../lib/auth.js';
import { alertaErro, alertaSucesso, alertaAviso } from '../lib/alerts.js';
import { montarShell } from '../ui/layout.js';
import { heroicon, renderHeroicons } from '../ui/icons.js';
import { intervaloPagina, renderizarPaginacao } from '../ui/paginacao.js';

let paginaAtual = 1;
let marcas = [];

function limparFormulario() {
  document.querySelector('#marca-id').value = '';
  document.querySelector('#marca-nome').value = '';
}

async function carregarMarcas() {
  const { inicio, fim } = intervaloPagina(paginaAtual);
  const { data, count, error } = await supabase
    .from('marcas')
    .select('id, nome', { count: 'exact' })
    .order('nome')
    .range(inicio, fim);

  if (error) throw error;
  marcas = data;

  document.querySelector('#tabela-marcas').innerHTML =
    data
      .map(
        (marca) => `<tr>
          <td class="font-semibold">${marca.nome}</td>
          <td>
            <button class="btn-secondary" type="button" data-editar="${marca.id}">
              ${heroicon('pencil')}Editar
            </button>
          </td>
        </tr>`,
      )
      .join('') || '<tr><td colspan="2" class="text-center text-slate-500">Não há marcas cadastradas.</td></tr>';

  document.querySelectorAll('[data-editar]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const marca = marcas.find((item) => item.id === botao.dataset.editar);
      document.querySelector('#marca-id').value = marca.id;
      document.querySelector('#marca-nome').value = marca.nome;
      document.querySelector('#marca-nome').focus();
    });
  });

  renderizarPaginacao(document.querySelector('#paginacao-marcas'), {
    paginaAtual,
    total: count,
    aoMudarPagina: async (pagina) => {
      paginaAtual = pagina;
      await carregarMarcas();
    },
  });
}

async function salvarMarca(event) {
  event.preventDefault();

  const id = document.querySelector('#marca-id').value;
  const nome = document.querySelector('#marca-nome').value.trim();

  if (!nome) {
    await alertaAviso('Informe o nome', 'O nome da marca é obrigatório.');
    return;
  }

  try {
    const resposta = id
      ? await supabase.from('marcas').update({ nome }).eq('id', id)
      : await supabase.from('marcas').insert({ nome });

    if (resposta.error) throw resposta.error;

    limparFormulario();
    await carregarMarcas();
    await alertaSucesso('Marca salva', 'O cadastro foi atualizado com sucesso.');
  } catch (error) {
    alertaErro('Não foi possível salvar a marca', error);
  }
}

async function iniciar() {
  try {
    const autenticacao = await verificarAutenticacao();
    if (!autenticacao) return;
    montarShell({ titulo: 'Marcas', descricao: 'Cadastre as marcas usadas nos veículos.', perfil: autenticacao.perfil });
    document.querySelector('#form-marca').addEventListener('submit', salvarMarca);
    document.querySelector('#limpar-marca').addEventListener('click', limparFormulario);
    renderHeroicons();
    await carregarMarcas();
  } catch (error) {
    alertaErro('Falha ao carregar marcas', error);
  }
}

iniciar();
