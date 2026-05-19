import '../style-entry.js';
import { logout } from '../lib/auth.js';
import { alertaErro } from '../lib/alerts.js';
import { appUrl } from '../lib/urls.js';
import { heroicon, renderHeroicons } from './icons.js';

const menu = [
  { href: '/pages/dashboard.html', texto: 'Dashboard', icon: 'chart-bar' },
  { href: '/pages/marcas.html', texto: 'Marcas', icon: 'tag' },
  { href: '/pages/modelos.html', texto: 'Modelos', icon: 'squares-2x2' },
  { href: '/pages/clientes.html', texto: 'Clientes', icon: 'users' },
  { href: '/pages/veiculos.html', texto: 'Veículos', icon: 'truck' },
  { href: '/pages/movimentacoes.html', texto: 'Movimentações', icon: 'clipboard-document-list' },
  { href: '/pages/patio.html', texto: 'Pátio', icon: 'truck' },
  { href: '/pages/historico.html', texto: 'Histórico', icon: 'calendar' },
];

export function formatarDataHora(valor) {
  if (!valor) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(valor));
}

export function formatarMoeda(valor) {
  if (valor === null || valor === undefined) return '-';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
}

export function textoStatus(status) {
  return status === 'aberta' ? 'Aberta' : 'Encerrada';
}

export function montarShell({ titulo, descricao, perfil }) {
  const shell = document.querySelector('#app-shell');
  const header = document.querySelector('#page-header');

  shell.insertAdjacentHTML(
    'afterbegin',
    `<aside class="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-5 lg:block dark:border-slate-800 dark:bg-slate-900">
      <div class="mb-8 flex items-center gap-3">
        <img src="${appUrl('/assets/logo.png')}" alt="Logotipo do Estacionamentos" class="h-10 w-10 object-contain" />
        <strong class="text-lg">Estacionamentos</strong>
      </div>
      <nav class="space-y-1">
        ${menu
          .map(
            (item) =>
              `<a href="${appUrl(item.href)}" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">${heroicon(item.icon)}${item.texto}</a>`,
          )
          .join('')}
      </nav>
    </aside>`,
  );

  header.innerHTML = `<header class="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between dark:border-slate-800">
    <div>
      <h1 class="text-2xl font-bold">${titulo}</h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">${descricao}</p>
    </div>
    <div class="flex items-center gap-3">
      <div class="text-right text-sm">
        <p class="font-semibold">${perfil.nome}</p>
        <p class="text-slate-500 dark:text-slate-400">${perfil.tipo_usuario === 'cliente' ? 'Cliente' : 'Proprietário'}</p>
      </div>
      <button id="botao-sair" class="btn-secondary" type="button">${heroicon('arrow-left-on-rectangle')}Sair</button>
    </div>
  </header>`;

  document.querySelector('#botao-sair')?.addEventListener('click', async () => {
    try {
      const { error } = await logout();
      if (error) throw error;
      window.location.href = appUrl('/login.html');
    } catch (error) {
      alertaErro('Não foi possível sair', error);
    }
  });

  renderHeroicons();
}
