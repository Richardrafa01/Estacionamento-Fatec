import { supabase } from '../lib/supabase.js';
import { verificarAutenticacao } from '../lib/auth.js';
import { alertaErro } from '../lib/alerts.js';
import { formatarDataHora, formatarMoeda, montarShell, textoStatus } from '../ui/layout.js';
import { intervaloPagina, renderizarPaginacao } from '../ui/paginacao.js';

let paginaAtual = 1;
const filtros = {
  placa: '',
  inicio: '',
  fim: '',
  status: '',
};

function atualizarFiltros() {
  filtros.placa = document.querySelector('#filtro-placa').value.trim().toUpperCase();
  filtros.inicio = document.querySelector('#filtro-inicio').value;
  filtros.fim = document.querySelector('#filtro-fim').value;
  filtros.status = document.querySelector('#filtro-status').value;
}

async function carregarHistorico() {
  const { inicio, fim } = intervaloPagina(paginaAtual);
  let query = supabase
    .from('movimentacoes')
    .select('id, data_hora_entrada, data_hora_saida, valor_cobrado, status, veiculos!inner(placa, marcas(nome), modelos(nome), clientes(nome))', {
      count: 'exact',
    })
    .order('data_hora_entrada', { ascending: false });

  if (filtros.placa) query = query.ilike('veiculos.placa', `%${filtros.placa}%`);
  if (filtros.status) query = query.eq('status', filtros.status);
  if (filtros.inicio) query = query.gte('data_hora_entrada', `${filtros.inicio}T00:00:00`);
  if (filtros.fim) query = query.lte('data_hora_entrada', `${filtros.fim}T23:59:59`);

  const { data, count, error } = await query.range(inicio, fim);
  if (error) throw error;

  const linhas = data
    .map((movimentacao) => {
      const veiculo = movimentacao.veiculos;
      return `<tr>
        <td class="font-semibold">${veiculo?.placa || '-'}</td>
        <td>${veiculo?.marcas?.nome || '-'} ${veiculo?.modelos?.nome || ''}</td>
        <td>${veiculo?.clientes?.nome || 'Avulso'}</td>
        <td>${formatarDataHora(movimentacao.data_hora_entrada)}</td>
        <td>${formatarDataHora(movimentacao.data_hora_saida)}</td>
        <td>${formatarMoeda(movimentacao.valor_cobrado)}</td>
        <td>${textoStatus(movimentacao.status)}</td>
      </tr>`;
    })
    .join('');

  document.querySelector('#tabela-historico').innerHTML =
    linhas || '<tr><td colspan="7" class="text-center text-slate-500">Não há movimentações para os filtros atuais.</td></tr>';

  renderizarPaginacao(document.querySelector('#paginacao-historico'), {
    paginaAtual,
    total: count,
    aoMudarPagina: async (pagina) => {
      paginaAtual = pagina;
      await carregarHistorico();
    },
  });
}

async function iniciar() {
  try {
    const autenticacao = await verificarAutenticacao();
    if (!autenticacao) return;
    const { perfil } = autenticacao;
    montarShell({ titulo: 'Histórico', descricao: 'Consulte movimentações abertas e encerradas.', perfil });

    document.querySelector('#form-filtros').addEventListener('submit', async (event) => {
      event.preventDefault();
      atualizarFiltros();
      paginaAtual = 1;
      await carregarHistorico();
    });

    document.querySelector('#limpar-filtros').addEventListener('click', async () => {
      document.querySelector('#form-filtros').reset();
      atualizarFiltros();
      paginaAtual = 1;
      await carregarHistorico();
    });

    await carregarHistorico();
  } catch (error) {
    alertaErro('Falha ao carregar o histórico', error);
  }
}

iniciar();
