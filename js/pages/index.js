import '../style-entry.js';
import { getUsuarioAtual, buscarPerfil, redirecionarPorPerfil } from '../lib/auth.js';
import { appUrl } from '../lib/urls.js';

async function iniciar() {
  try {
    const usuario = await getUsuarioAtual();
    if (!usuario) {
      window.location.href = appUrl('/login.html');
      return;
    }

    const perfil = await buscarPerfil(usuario.id);
    redirecionarPorPerfil(perfil);
  } catch {
    window.location.href = appUrl('/login.html');
  }
}

iniciar();
