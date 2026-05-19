import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'pages/dashboard.html'),
        marcas: resolve(__dirname, 'pages/marcas.html'),
        modelos: resolve(__dirname, 'pages/modelos.html'),
        clientes: resolve(__dirname, 'pages/clientes.html'),
        veiculos: resolve(__dirname, 'pages/veiculos.html'),
        movimentacoes: resolve(__dirname, 'pages/movimentacoes.html'),
        patio: resolve(__dirname, 'pages/patio.html'),
        historico: resolve(__dirname, 'pages/historico.html'),
        dashboardCliente: resolve(__dirname, 'cliente/dashboard-cliente.html'),
      },
    },
  },
});
