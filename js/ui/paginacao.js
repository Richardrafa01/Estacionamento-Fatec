export const TAMANHO_PAGINA = 10;

export function intervaloPagina(paginaAtual) {
  const inicio = (paginaAtual - 1) * TAMANHO_PAGINA;
  const fim = inicio + TAMANHO_PAGINA - 1;
  return { inicio, fim };
}

export function totalPaginas(total) {
  return Math.max(1, Math.ceil((total || 0) / TAMANHO_PAGINA));
}

export function renderizarPaginacao(container, { paginaAtual, total, aoMudarPagina }) {
  const paginas = totalPaginas(total);

  container.innerHTML = `<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-slate-600 dark:text-slate-300">Página ${paginaAtual} de ${paginas} • ${total || 0} registro(s)</p>
    <div class="flex gap-2">
      <button class="btn-secondary" type="button" data-pagina="anterior" ${paginaAtual <= 1 ? 'disabled' : ''}>Anterior</button>
      <button class="btn-secondary" type="button" data-pagina="proxima" ${paginaAtual >= paginas ? 'disabled' : ''}>Próxima</button>
    </div>
  </div>`;

  container.querySelector('[data-pagina="anterior"]')?.addEventListener('click', () => aoMudarPagina(paginaAtual - 1));
  container.querySelector('[data-pagina="proxima"]')?.addEventListener('click', () => aoMudarPagina(paginaAtual + 1));
}
