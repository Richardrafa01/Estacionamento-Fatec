import { supabase } from '../lib/supabase.js';
import { verificarAutenticacao } from '../lib/auth.js';
import { alertaErro, alertaSucesso, alertaAviso, confirmarAcao } from '../lib/alerts.js';
import { montarShell } from '../ui/layout.js';

function normalizarPlaca(valor) {
  return valor.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

async function buscarVeiculoAtivo(placa) {
  const { data, error } = await supabase
    .from('veiculos')
    .select('id, placa, ativo')
    .eq('placa', placa)
    .eq('ativo', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function buscarMovimentacaoAberta(veiculoId) {
  const { data, error } = await supabase
    .from('movimentacoes')
    .select('id, veiculo_id, data_hora_entrada, status')
    .eq('veiculo_id', veiculoId)
    .eq('status', 'aberta')
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function registrarEntrada(event) {
  event.preventDefault();

  const placa = normalizarPlaca(document.querySelector('#placa-entrada').value);
  if (!placa) {
    await alertaAviso('Informe a placa', 'A placa do veículo é obrigatória para registrar entrada.');
    return;
  }

  try {
    const veiculo = await buscarVeiculoAtivo(placa);
    if (!veiculo) {
      await alertaAviso('Veículo não encontrado', 'Cadastre um veículo ativo com esta placa antes de registrar a entrada.');
      return;
    }

    const aberta = await buscarMovimentacaoAberta(veiculo.id);

    if (aberta) {
      await alertaAviso('Entrada já registrada', 'Este veículo já possui uma movimentação aberta.');
      return;
    }

    const confirmado = await confirmarAcao('Confirmar entrada?', `Registrar entrada para a placa ${placa}?`, 'Registrar');
    if (!confirmado) return;

    const { error } = await supabase.from('movimentacoes').insert({
      veiculo_id: veiculo.id,
      data_hora_entrada: new Date().toISOString(),
      status: 'aberta',
    });

    if (error) throw error;

    document.querySelector('#form-entrada').reset();
    await alertaSucesso('Entrada registrada', 'A movimentação foi aberta com sucesso.');
  } catch (error) {
    alertaErro('Não foi possível registrar a entrada', error);
  }
}

async function registrarSaida(event) {
  event.preventDefault();

  const placa = normalizarPlaca(document.querySelector('#placa-saida').value);
  const valor = Number(document.querySelector('#valor-cobrado').value);

  if (!placa || Number.isNaN(valor) || valor < 0) {
    await alertaAviso('Dados inválidos', 'Informe a placa e um valor cobrado válido.');
    return;
  }

  try {
    const veiculo = await buscarVeiculoAtivo(placa);
    if (!veiculo) {
      await alertaAviso('Veículo não encontrado', 'Não existe veículo ativo com esta placa.');
      return;
    }

    const aberta = await buscarMovimentacaoAberta(veiculo.id);

    if (!aberta) {
      await alertaAviso('Não há entrada aberta', 'Este veículo não possui movimentação aberta para saída.');
      return;
    }

    const confirmado = await confirmarAcao('Confirmar saída?', `Encerrar movimentação da placa ${placa}?`, 'Encerrar');
    if (!confirmado) return;

    const { error } = await supabase
      .from('movimentacoes')
      .update({
        data_hora_saida: new Date().toISOString(),
        valor_cobrado: valor,
        status: 'encerrada',
      })
      .eq('id', aberta.id);

    if (error) throw error;

    document.querySelector('#form-saida').reset();
    await alertaSucesso('Saída registrada', 'A movimentação foi encerrada com sucesso.');
  } catch (error) {
    alertaErro('Não foi possível registrar a saída', error);
  }
}

async function iniciar() {
  try {
    const autenticacao = await verificarAutenticacao();
    if (!autenticacao) return;
    const { perfil } = autenticacao;
    montarShell({ titulo: 'Movimentações', descricao: 'Registre entradas e saídas de veículos.', perfil });
    document.querySelector('#form-entrada').addEventListener('submit', registrarEntrada);
    document.querySelector('#form-saida').addEventListener('submit', registrarSaida);
  } catch (error) {
    alertaErro('Falha ao carregar movimentações', error);
  }
}

iniciar();
