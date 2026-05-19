import { supabase } from '../lib/supabase.js';
import { verificarAutenticacao } from '../lib/auth.js';
import { alertaErro } from '../lib/alerts.js';
import { formatarDataHora, montarShell } from '../ui/layout.js';
import { intervaloPagina, renderizarPaginacao } from '../ui/paginacao.js';

let paginaAtual = 1;

async function carregarPatio() {
  const { inicio, fim } = intervaloPagina(paginaAtual);
  const { data, count, error } = await supabase
    .from('movimentacoes')
    .select('id, data_hora_entrada, veiculos(placa, tipo_cliente, marcas(nome), modelos(nome), clientes(nome))', { count: 'exact' })
    .eq('status', 'aberta')
    .order('data_hora_entrada', { ascending: true })
    .range(inicio, fim);

  if (error) throw error;

  const linhas = data
    .map((movimentacao) => {
      const veiculo = movimentacao.veiculos;
      return `<tr>
        <td class="font-semibold">${veiculo?.placa || '-'}</td>
        <td>${veiculo?.marcas?.nome || '-'}</td>
        <td>${veiculo?.modelos?.nome || '-'}</td>
        <td>${veiculo?.clientes?.nome || 'Avulso'}</td>
        <td>${veiculo?.tipo_cliente === 'mensalista' ? 'Mensalista' : 'Avulso'}</td>
        <td>${formatarDataHora(movimentacao.data_hora_entrada)}</td>
      </tr>`;
    })
    .join('');

  document.querySelector('#tabela-patio').innerHTML =
    linhas || '<tr><td colspan="6" class="text-center text-slate-500">Não há veículos no pátio.</td></tr>';

  renderizarPaginacao(document.querySelector('#paginacao-patio'), {
    paginaAtual,
    total: count,
    aoMudarPagina: async (pagina) => {
      paginaAtual = pagina;
      await carregarPatio();
    },
  });
}

async function iniciar() {
  try {
    const autenticacao = await verificarAutenticacao();
    if (!autenticacao) return;
    const { perfil } = autenticacao;
    montarShell({ titulo: 'Pátio', descricao: 'Veículos com movimentação aberta no momento.', perfil });
    await carregarPatio();
  } catch (error) {
    alertaErro('Falha ao carregar o pátio', error);
  }
}

iniciar();
