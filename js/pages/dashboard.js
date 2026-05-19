import { supabase } from '../lib/supabase.js';
import { verificarAutenticacao } from '../lib/auth.js';
import { alertaErro } from '../lib/alerts.js';
import { formatarDataHora, montarShell, textoStatus } from '../ui/layout.js';
import { heroicon } from '../ui/icons.js';

function intervaloHoje() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date();
  fim.setHours(23, 59, 59, 999);

  return { inicio: inicio.toISOString(), fim: fim.toISOString() };
}

async function contar(tabela, filtros) {
  let query = supabase.from(tabela).select('id', { count: 'exact', head: true });
  filtros.forEach(([coluna, operador, valor]) => {
    query = query[operador](coluna, valor);
  });

  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

function renderCard({ titulo, valor, icon, cor }) {
  return `<article class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-slate-600 dark:text-slate-300">${titulo}</p>
        <strong class="mt-2 block text-3xl font-bold">${valor}</strong>
      </div>
      <div class="rounded-lg ${cor} p-3 text-white">${heroicon(icon, 'h-6 w-6')}</div>
    </div>
  </article>`;
}

async function carregarDashboard() {
  const { inicio, fim } = intervaloHoje();
  const [veiculosPatio, mensalistasAtivos, entradasHoje, saidasHoje, recentes] = await Promise.all([
    contar('movimentacoes', [['status', 'eq', 'aberta']]),
    contar('clientes', [['ativo', 'eq', true]]),
    contar('movimentacoes', [
      ['data_hora_entrada', 'gte', inicio],
      ['data_hora_entrada', 'lte', fim],
    ]),
    contar('movimentacoes', [
      ['data_hora_saida', 'gte', inicio],
      ['data_hora_saida', 'lte', fim],
    ]),
    supabase
      .from('movimentacoes')
      .select('id, data_hora_entrada, status, veiculos(placa, marcas(nome), modelos(nome))')
      .order('data_hora_entrada', { ascending: false })
      .limit(5),
  ]);

  if (recentes.error) throw recentes.error;

  document.querySelector('#cards-resumo').innerHTML = [
    renderCard({ titulo: 'Veículos no pátio', valor: veiculosPatio, icon: 'truck', cor: 'bg-purple-600' }),
    renderCard({ titulo: 'Mensalistas ativos', valor: mensalistasAtivos, icon: 'users', cor: 'bg-green-600' }),
    renderCard({ titulo: 'Entradas hoje', valor: entradasHoje, icon: 'arrow-down-circle', cor: 'bg-blue-600' }),
    renderCard({ titulo: 'Saídas hoje', valor: saidasHoje, icon: 'arrow-up-circle', cor: 'bg-amber-500' }),
  ].join('');

  const linhas = recentes.data
    .map((movimentacao) => {
      const veiculo = movimentacao.veiculos;
      return `<tr>
        <td class="font-semibold">${veiculo?.placa || '-'}</td>
        <td>${veiculo?.marcas?.nome || '-'} ${veiculo?.modelos?.nome || ''}</td>
        <td>${formatarDataHora(movimentacao.data_hora_entrada)}</td>
        <td>${textoStatus(movimentacao.status)}</td>
      </tr>`;
    })
    .join('');

  document.querySelector('#tabela-recentes').innerHTML =
    linhas || '<tr><td colspan="4" class="text-center text-slate-500">Não há movimentações recentes.</td></tr>';
}

async function iniciar() {
  try {
    const autenticacao = await verificarAutenticacao();
    if (!autenticacao) return;
    const { perfil } = autenticacao;
    montarShell({ titulo: 'Dashboard', descricao: 'Resumo operacional do estacionamento.', perfil });
    await carregarDashboard();
  } catch (error) {
    alertaErro('Falha ao carregar o dashboard', error);
  }
}

iniciar();
