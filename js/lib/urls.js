export function appUrl(path) {
  const cleanPath = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || '/';

  if (base && base !== './') {
    return `${base.replace(/\/$/, '')}/${cleanPath}`;
  }

  if (window.location.pathname.includes('/pages/') || window.location.pathname.includes('/cliente/')) {
    return `../${cleanPath}`;
  }

  return cleanPath;
}
