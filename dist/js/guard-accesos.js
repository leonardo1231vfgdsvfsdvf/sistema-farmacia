(() => {
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const AUTH_PAGES = new Set(['login.html', 'register.html', 'recuperar.html']);

  // ---------- helpers ----------
  const getSession = () => {
    const raw = localStorage.getItem('session');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  };

  const clearAllAndGoLogin = () => {
    try {
      localStorage.removeItem('session');
      sessionStorage.clear();
      // borrar cookies de forma básica
      document.cookie.split(';').forEach(c => {
        const name = c.split('=')[0].trim();
        if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    } catch {}
    // replace evita volver con la flecha
    location.replace('login.html');
  };

  const session = getSession();

  // Sin sesión → solo páginas de auth
  if (!session || !session.loggedIn) {
    if (!AUTH_PAGES.has(page)) {
      return location.replace('login.html');
    }
    // Si es página de auth, nada más que hacer
    // (abajo tenemos el handler pageshow que vuelve a chequear)
    return;
  }

  // ============ Con sesión ============
  // Si ya está logueado y entra a login.html, redirigir a su home por rol
  const can = (mod) => {
    const acc = session.user?.accesos || [];
    if (acc.length && typeof acc[0] === 'object') {
      return acc.some(a => String(a.modulo || '').toUpperCase() === mod && a.acceso === true);
    }
    return acc.map(x => String(x).toUpperCase()).includes(mod);
  };

  const defaultAllowedPage = () => {
    if (can('VENTAS'))    return 'ventas.html';    // vendedor
    if (can('CLIENTES'))  return 'clientes.html';
    if (can('PRODUCTOS')) return 'productos.html'; // almacén
    if (can('USUARIOS'))  return 'usuarios.html';  // admin
    return 'index.html';
  };

  if (page === 'login.html') {
    location.replace('index.html');
    return;
  }

  // Ocultar menús según permisos (si existen esos IDs)
  const hideIfNo = (mod, id) => {
    if (!can(mod)) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    }
  };
  hideIfNo('USUARIOS',  'menu-usuarios');
  hideIfNo('CLIENTES',  'menu-clientes');
  hideIfNo('PRODUCTOS', 'menu-productos');
  hideIfNo('VENTAS',    'menu-ventas');

  // Bloquear acceso directo por URL
  const pageToModule = {
    'usuarios.html' : 'USUARIOS',
    'clientes.html' : 'CLIENTES',
    'productos.html': 'PRODUCTOS',
    'ventas.html'   : 'VENTAS'
  };
  const needed = pageToModule[page];
  if (needed && !can(needed)) {
    return location.replace(defaultAllowedPage());
  }

  // Exponer sesión y poblar navbar (si existen nodos)
  window.__SESSION__ = session;
  const setText = (sel, txt) => { const el = document.querySelector(sel); if (el) el.textContent = txt; };
  const setSrc  = (sel, src) => { const el = document.querySelector(sel); if (el) el.src = src; };
  setText('#navbar-username', session.user?.username || 'Usuario');
  setSrc('.user-image', session.user?.avatarUrl || '/assets/img/alexanderpierce.jpg');
  setSrc('.user-header img', session.user?.avatarUrl || '/assets/img/alexanderpierce.jpg');
  setText('#user-fullname', session.user?.nombreCompleto || '');
  setText('#user-email', session.user?.email || '');
  setText('#user-address', session.user?.direccion || '');

  // Hook universal de logout (si existe el botón en la página)
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      clearAllAndGoLogin();
    });
  }

  // ===== Manejar “back/forward cache” (flecha atrás) =====
  // Si vuelven a una página protegida sin sesión → a login.
  window.addEventListener('pageshow', (ev) => {
    const backForward = ev.persisted ||
      (performance.getEntriesByType('navigation')[0]?.type === 'back_forward');
    if (!backForward) return;

    const s = getSession();
    const p = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const isAuth = AUTH_PAGES.has(p);

    if (!s || !s.loggedIn) {
      if (!isAuth) location.replace('login.html');
    } else {
      if (p === 'login.html') location.replace(defaultAllowedPage());
    }
  });

  // Exponer función por si quieres llamarla desde otros scripts
  window.forceLogout = clearAllAndGoLogin;
})();
