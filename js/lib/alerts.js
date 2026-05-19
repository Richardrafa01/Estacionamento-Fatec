import Swal from 'sweetalert2';

const temaEscuroAtivo = () => document.documentElement.classList.contains('dark');

export function alertaSucesso(titulo, texto = '') {
  return Swal.fire({
    icon: 'success',
    title: titulo,
    text: texto,
    confirmButtonColor: '#a855f7',
    background: temaEscuroAtivo() ? '#1E293B' : '#FFFFFF',
    color: temaEscuroAtivo() ? '#F8FAFC' : '#0F172A',
  });
}

export function alertaErro(titulo, erro) {
  const texto = typeof erro === 'string' ? erro : erro?.message || 'Ocorreu um erro inesperado.';

  return Swal.fire({
    icon: 'error',
    title: titulo,
    text: texto,
    confirmButtonColor: '#DC2626',
    background: temaEscuroAtivo() ? '#1E293B' : '#FFFFFF',
    color: temaEscuroAtivo() ? '#F8FAFC' : '#0F172A',
  });
}

export function alertaAviso(titulo, texto) {
  return Swal.fire({
    icon: 'warning',
    title: titulo,
    text: texto,
    confirmButtonColor: '#F59E0B',
    background: temaEscuroAtivo() ? '#1E293B' : '#FFFFFF',
    color: temaEscuroAtivo() ? '#F8FAFC' : '#0F172A',
  });
}

export async function confirmarAcao(titulo, texto, textoConfirmacao = 'Confirmar') {
  const resultado = await Swal.fire({
    icon: 'question',
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: textoConfirmacao,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#a855f7',
    cancelButtonColor: '#64748B',
    background: temaEscuroAtivo() ? '#1E293B' : '#FFFFFF',
    color: temaEscuroAtivo() ? '#F8FAFC' : '#0F172A',
  });

  return resultado.isConfirmed;
}
