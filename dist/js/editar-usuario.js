document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id  = parseInt(params.get('id'), 10);
  if (!id) return alert('ID de usuario no especificado');

  try {
    // 1) Cargamos todo el JSON
    const res = await fetch('usuarios.json');
    if (!res.ok) throw new Error('No se pudo cargar usuarios.json');
    const lista = await res.json();

    // 2) Buscamos el que tenga el id correcto
    const user = lista.find(u => u.id === id);
    if (!user) throw new Error('Usuario no encontrado');

    // 3) Rellenamos el formulario
    document.getElementById('user-id').value       = user.id;
    document.getElementById('username').value      = user.username;
    document.getElementById('nombreCompleto').value= user.nombreCompleto;
    document.getElementById('celular').value       = user.celular;
    document.getElementById('email').value         = user.email;

  } catch (err) {
    alert(err.message);
    window.location.href = 'usuarios.html';
  }
});
