import '../style-entry.js';
import { supabase } from '../lib/supabase.js';
import { verificarAutenticacao, logout } from '../lib/auth.js';
import { alertaErro } from '../lib/alerts.js';
import { appUrl } from '../lib/urls.js';
import { formatarDataHora, textoStatus } from '../ui/layout.js';
import { heroicon, renderHeroicons } from '../ui/icons.js';

function montarHeader(perfil) {
  document.querySelector('#page-header').innerHTML = `<header class="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between dark:border-slate-800">
    <div class="flex items-center gap-3">
      <img src="${appUrl('/assets/logo.png')}" alt="Logotipo do Estacionamentos" class="h-10 w-10 object-contain" />
      <div>
        <h1 class="text-2xl font-bold">Área do cliente</h1>
        <p class="text-sm text-slate-600 dark:text-slate-300">Consulte seus veículos e movimentações.</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="text-right text-sm">
        <p class="font-semibold">${perfil.nome}</p>
        <p class="text-slate-500 dark:text-slate-400">Cliente</p>
      </div>
      <button id="botao-sair" class="btn-secondary" type="button">${heroicon('arrow-left-on-rectangle')}Sair</button>
    </div>
  </header>`;

  document.querySelector('#botao-sair').addEventListener('click', async () => {
    const { error } = await logout();
    if (error) throw error;
    window.location.href = appUrl('/login.html');
  });

  renderHeroicons();
}

async function carregarDadosCliente(perfil) {
  const { data: cliente, error: erroCliente } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', perfil.user_id)
    .single();

  if (erroCliente) throw erroCliente;

  const { data: veiculos, error: erroVeiculos } = await supabase
    .from('veiculos')
    .select('id, placa, ativo, marcas(nome), modelos(nome)')
    .eq('cliente_id', cliente.id)
    .order('placa');

  if (erroVeiculos) throw erroVeiculos;

  const ids = veiculos.map((veiculo) => veiculo.id);
  let historico = [];

  if (ids.length) {
    const { data, error: erroHistorico } = await supabase
      .from('movimentacoes')
      .select('id, data_hora_entrada, data_hora_saida, status, veiculos(placa)')
      .in('veiculo_id', ids)
      .order('data_hora_entrada', { ascending: false })
      .limit(10);

    if (erroHistorico) throw erroHistorico;
    historico = data;
  }

  document.querySelector('#tabela-veiculos-cliente').innerHTML =
    veiculos
      .map(
        (veiculo) => `<tr>
          <td class="font-semibold">${veiculo.placa}</td>
          <td>${veiculo.marcas?.nome || '-'}</td>
          <td>${veiculo.modelos?.nome || '-'}</td>
          <td>${veiculo.ativo ? 'Ativo' : 'Inativo'}</td>
        </tr>`,
      )
      .join('') || '<tr><td colspan="4" class="text-center text-slate-500">Não há veículos cadastrados.</td></tr>';

  document.querySelector('#tabela-historico-cliente').innerHTML =
    historico
      .map(
        (movimentacao) => `<tr>
          <td class="font-semibold">${movimentacao.veiculos?.placa || '-'}</td>
          <td>${formatarDataHora(movimentacao.data_hora_entrada)}</td>
          <td>${formatarDataHora(movimentacao.data_hora_saida)}</td>
          <td>${textoStatus(movimentacao.status)}</td>
        </tr>`,
      )
      .join('') || '<tr><td colspan="4" class="text-center text-slate-500">Não há movimentações para exibir.</td></tr>';
}

async function iniciar() {
  try {
    const autenticacao = await verificarAutenticacao();
    if (!autenticacao) return;
    const { perfil } = autenticacao;
    montarHeader(perfil);
    await carregarDadosCliente(perfil);
  } catch (error) {
    alertaErro('Falha ao carregar a área do cliente', error);
  }
}

iniciar();
