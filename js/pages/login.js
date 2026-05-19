import '../style-entry.js';
import { alertaErro, alertaAviso } from '../lib/alerts.js';
import { getUsuarioAtual, buscarPerfil, login, redirecionarPorPerfil } from '../lib/auth.js';
import { renderHeroicons } from '../ui/icons.js';

async function redirecionarSessaoAtiva() {
  const usuario = await getUsuarioAtual();
  if (!usuario) return;
  const perfil = await buscarPerfil(usuario.id);
  redirecionarPorPerfil(perfil);
}

document.querySelector('#form-login').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.querySelector('#email').value.trim();
  const senha = document.querySelector('#senha').value;

  if (!email || !senha) {
    await alertaAviso('Preencha os campos obrigatórios', 'Informe e-mail e senha para entrar.');
    return;
  }

  try {
    const { data, error } = await login(email, senha);
    if (error) throw error;

    const perfil = await buscarPerfil(data.user.id);
    redirecionarPorPerfil(perfil);
  } catch (error) {
    alertaErro('Não foi possível entrar', error);
  }
});

renderHeroicons();
redirecionarSessaoAtiva().catch(() => {});
