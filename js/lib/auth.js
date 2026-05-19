import { supabase } from './supabase.js';
import { appUrl } from './urls.js';

export async function login(email, senha) {
  return supabase.auth.signInWithPassword({ email, password: senha });
}

export async function logout() {
  return supabase.auth.signOut();
}

export async function getUsuarioAtual() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function buscarPerfil(userId) {
  const { data, error } = await supabase
    .from('perfis')
    .select('id, user_id, nome, email, tipo_usuario')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function verificarAutenticacao() {
  const usuario = await getUsuarioAtual();

  if (!usuario) {
    window.location.href = appUrl('/login.html');
    return null;
  }

  const perfil = await buscarPerfil(usuario.id);
  return { usuario, perfil };
}

export function redirecionarPorPerfil(perfil) {
  if (perfil?.tipo_usuario === 'cliente') {
    window.location.href = appUrl('/cliente/dashboard-cliente.html');
    return;
  }

  window.location.href = appUrl('/pages/dashboard.html');
}
