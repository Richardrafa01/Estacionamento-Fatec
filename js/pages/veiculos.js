import { supabase } from '../lib/supabase.js';
import { verificarAutenticacao } from '../lib/auth.js';
import { alertaErro, alertaSucesso, alertaAviso, confirmarAcao } from '../lib/alerts.js';
import { montarShell } from '../ui/layout.js';
import { heroicon, renderHeroicons } from '../ui/icons.js';
import { intervaloPagina, renderizarPaginacao } from '../ui/paginacao.js';

let paginaAtual = 1;
let veiculos = [];
let marcas = [];
let modelos = [];
let clientes = [];

function normalizarPlaca(valor) {
  return valor.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function limparFormulario() {
  document.querySelector('#veiculo-id').value = '';
  document.querySelector('#veiculo-placa').value = '';
  document.querySelector('#veiculo-cor').value = '';
  document.querySelector('#veiculo-tipo').value = 'mensalista';
  document.querySelector('#veiculo-cliente').value = '';
  document.querySelector('#veiculo-marca').value = '';
  document.querySelector('#veiculo-modelo').innerHTML = '<option value="">Selecione a marca</option>';
}

function preencherSelects() {
  document.querySelector('#veiculo-cliente').innerHTML =
    '<option value="">Sem cliente</option>' + clientes.map((cliente) => `<option value="${cliente.id}">${cliente.nome}</option>`).join('');
  document.querySelector('#veiculo-marca').innerHTML =
    '<option value="">Selecione</option>' + marcas.map((marca) => `<option value="${marca.id}">${marca.nome}</option>`).join('');
}

function carregarModelosDaMarca(marcaId, modeloSelecionado = '') {
  const opcoes = modelos
    .filter((modelo) => modelo.marca_id === marcaId)
    .map((modelo) => `<option value="${modelo.id}" ${modelo.id === modeloSelecionado ? 'selected' : ''}>${modelo.nome}</option>`)
    .join('');

  document.querySelector('#veiculo-modelo').innerHTML = '<option value="">Selecione</option>' + opcoes;
}

async function carregarDadosFormulario() {
  const [resMarcas, resModelos, resClientes] = await Promise.all([
    supabase.from('marcas').select('id, nome').order('nome'),
    supabase.from('modelos').select('id, nome, marca_id').order('nome'),
    supabase.from('clientes').select('id, nome').eq('ativo', true).order('nome'),
  ]);

  if (resMarcas.error) throw resMarcas.error;
  if (resModelos.error) throw resModelos.error;
  if (resClientes.error) throw resClientes.error;

  marcas = resMarcas.data;
  modelos = resModelos.data;
  clientes = resClientes.data;
  preencherSelects();
}

async function carregarVeiculos() {
  const { inicio, fim } = intervaloPagina(paginaAtual);
  const { data, count, error } = await supabase
    .from('veiculos')
    .select('id, placa, cor, tipo_cliente, ativo, cliente_id, marca_id, modelo_id, marcas(nome), modelos(nome), clientes(nome)', { count: 'exact' })
    .order('placa')
    .range(inicio, fim);

  if (error) throw error;
  veiculos = data;

  document.querySelector('#tabela-veiculos').innerHTML =
    data
      .map(
        (veiculo) => `<tr>
          <td class="font-semibold">${veiculo.placa}</td>
          <td>${veiculo.marcas?.nome || '-'} ${veiculo.modelos?.nome || ''}</td>
          <td>${veiculo.clientes?.nome || 'Avulso'}</td>
          <td>${veiculo.tipo_cliente === 'mensalista' ? 'Mensalista' : 'Avulso'}</td>
          <td>${veiculo.ativo ? 'Ativo' : 'Inativo'}</td>
          <td>
            <div class="flex flex-wrap gap-2">
              <button class="btn-secondary" type="button" data-editar="${veiculo.id}">${heroicon('pencil')}Editar</button>
              <button class="${veiculo.ativo ? 'btn-danger' : 'btn-success'}" type="button" data-status="${veiculo.id}">
                ${heroicon(veiculo.ativo ? 'power' : 'arrow-path')}${veiculo.ativo ? 'Inativar' : 'Reativar'}
              </button>
            </div>
          </td>
        </tr>`,
      )
      .join('') || '<tr><td colspan="6" class="text-center text-slate-500">Não há veículos cadastrados.</td></tr>';

  document.querySelectorAll('[data-editar]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const veiculo = veiculos.find((item) => item.id === botao.dataset.editar);
      document.querySelector('#veiculo-id').value = veiculo.id;
      document.querySelector('#veiculo-placa').value = veiculo.placa;
      document.querySelector('#veiculo-cor').value = veiculo.cor || '';
      document.querySelector('#veiculo-tipo').value = veiculo.tipo_cliente;
      document.querySelector('#veiculo-cliente').value = veiculo.cliente_id || '';
      document.querySelector('#veiculo-marca').value = veiculo.marca_id;
      carregarModelosDaMarca(veiculo.marca_id, veiculo.modelo_id);
      document.querySelector('#veiculo-placa').focus();
    });
  });

  document.querySelectorAll('[data-status]').forEach((botao) => {
    botao.addEventListener('click', async () => {
      const veiculo = veiculos.find((item) => item.id === botao.dataset.status);
      const confirmado = await confirmarAcao(`${veiculo.ativo ? 'Inativar' : 'Reativar'} veículo?`, `Deseja alterar a situação da placa ${veiculo.placa}?`, 'Confirmar');
      if (!confirmado) return;

      try {
        const { error } = await supabase.from('veiculos').update({ ativo: !veiculo.ativo }).eq('id', veiculo.id);
        if (error) throw error;
        await carregarVeiculos();
        await alertaSucesso('Veículo atualizado', 'A situação do veículo foi alterada.');
      } catch (error) {
        alertaErro('Não foi possível atualizar o veículo', error);
      }
    });
  });

  renderizarPaginacao(document.querySelector('#paginacao-veiculos'), {
    paginaAtual,
    total: count,
    aoMudarPagina: async (pagina) => {
      paginaAtual = pagina;
      await carregarVeiculos();
    },
  });
}

async function salvarVeiculo(event) {
  event.preventDefault();

  const id = document.querySelector('#veiculo-id').value;
  const placa = normalizarPlaca(document.querySelector('#veiculo-placa').value);
  const cor = document.querySelector('#veiculo-cor').value.trim() || null;
  const tipo_cliente = document.querySelector('#veiculo-tipo').value;
  const cliente_id = document.querySelector('#veiculo-cliente').value || null;
  const marca_id = document.querySelector('#veiculo-marca').value;
  const modelo_id = document.querySelector('#veiculo-modelo').value;

  if (!placa || !tipo_cliente || !marca_id || !modelo_id) {
    await alertaAviso('Preencha os campos obrigatórios', 'Informe placa, tipo, marca e modelo.');
    return;
  }

  if (tipo_cliente === 'mensalista' && !cliente_id) {
    await alertaAviso('Selecione o cliente', 'Veículo mensalista precisa estar vinculado a um cliente ativo.');
    return;
  }

  try {
    const payload = { placa, cor, tipo_cliente, cliente_id: tipo_cliente === 'avulso' ? null : cliente_id, marca_id, modelo_id, ativo: true };
    const payloadEdicao = { placa, cor, tipo_cliente, cliente_id: payload.cliente_id, marca_id, modelo_id };
    const resposta = id ? await supabase.from('veiculos').update(payloadEdicao).eq('id', id) : await supabase.from('veiculos').insert(payload);
    if (resposta.error) throw resposta.error;

    limparFormulario();
    await carregarVeiculos();
    await alertaSucesso('Veículo salvo', 'Agora este veículo pode ser usado no registro de entrada.');
  } catch (error) {
    alertaErro('Não foi possível salvar o veículo', error);
  }
}

async function iniciar() {
  try {
    const autenticacao = await verificarAutenticacao();
    if (!autenticacao) return;
    montarShell({ titulo: 'Veículos', descricao: 'Cadastre os veículos antes de registrar entradas.', perfil: autenticacao.perfil });
    document.querySelector('#form-veiculo').addEventListener('submit', salvarVeiculo);
    document.querySelector('#limpar-veiculo').addEventListener('click', limparFormulario);
    document.querySelector('#veiculo-marca').addEventListener('change', (event) => carregarModelosDaMarca(event.target.value));
    document.querySelector('#veiculo-tipo').addEventListener('change', (event) => {
      if (event.target.value === 'avulso') document.querySelector('#veiculo-cliente').value = '';
    });
    renderHeroicons();
    await carregarDadosFormulario();
    await carregarVeiculos();
  } catch (error) {
    alertaErro('Falha ao carregar veículos', error);
  }
}

iniciar();
