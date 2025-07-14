// 📁 components/navbar.js
import { getUsername, getUserRole, clearSession } from '../js/session.js';

export function loadNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const user = getUsername();
  const role = getUserRole();

  // Mostrar navbar solo si estamos en vistas protegidas y hay sesión
  if (!user || !role) {
    navbar.innerHTML = '';
    return;
  }

  navbar.innerHTML = `
    <nav class="flex justify-between items-center bg-gray-200 p-4 rounded mb-4">
      <div class="space-x-4">
        <span class="font-semibold text-gray-700">👋 Hola, ${user}</span>
        <a href="#/dashboard" class="text-blue-600 hover:underline">Inicio</a>
        <a href="#/tasks" class="text-blue-600 hover:underline">Tareas</a>
        ${role === 'admin' ? '<a href="#/admin-users" class="text-blue-600 hover:underline">Admin Usuarios</a>' : ''}
        ${role === 'admin' ? '<a href="#/trash" class="text-blue-600 hover:underline">🗑 Papelera</a>' : ''}
        ${role === 'admin' ? '<a href="#/trash-users" class="text-blue-600 hover:underline">Usuarios eliminados</a>' : ''}
      </div>
      <button id="logout" class="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700">Cerrar sesión</button>
    </nav>
  `;

  document.getElementById('logout')?.addEventListener('click', () => {
    clearSession();
    location.hash = '#/login';
  });
}
