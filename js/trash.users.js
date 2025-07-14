import axios from 'axios';
import { getUserRole, getUsername } from './session.js';

export async function loadTrashUsers() {
  const container = document.querySelector('#trash-users');
  if (!container) return;

  try {
    const { data: users } = await axios.get('http://localhost:3000/users?is_active=false');
    container.innerHTML = '';

    users.forEach(user => {
      const card = document.createElement('div');
      card.className = 'bg-gray-100 shadow p-4 rounded mb-4';

      card.innerHTML = `
        <h3 class="font-semibold text-gray-800">${user.username}</h3>
        <p class="text-sm text-gray-600">Correo: ${user.email}</p>
        <p class="text-sm text-gray-600">Estado: ${user.deleted_permanently ? 'Eliminado permanentemente' : 'En papelera'}</p>
        <div class="mt-2 space-x-2">
          ${
            !user.deleted_permanently
              ? `<button class="btn-restore bg-green-600 text-white px-3 py-1 rounded" data-id="${user.id}">Restaurar</button>
                 <button class="btn-permadelete bg-red-600 text-white px-3 py-1 rounded" data-id="${user.id}">Eliminar definitivamente</button>`
              : '<span class="text-red-600 text-sm">Eliminado permanentemente</span>'
          }
        </div>
      `;

      container.appendChild(card);

      // Restaurar usuario
      card.querySelector('.btn-restore')?.addEventListener('click', async () => {
        await axios.patch(`http://localhost:3000/users/${user.id}`, {
          is_active: true,
          deleted_at: null,
          deleted_permanently: false,
          deleted_by: null
        });
        loadTrashUsers();
      });

      // Eliminar definitivamente con contraseña
      card.querySelector('.btn-permadelete')?.addEventListener('click', async () => {
        const confirmDelete = confirm('¿Estás seguro de que quieres eliminar definitivamente este usuario?');
        if (!confirmDelete) return;

        const password = prompt('Introduce la contraseña de administrador para confirmar:');
        const session = JSON.parse(localStorage.getItem('session'));

        if (!password || password !== session.password || session.role !== 'admin') {
          alert('Contraseña incorrecta o no tienes permisos.');
          return;
        }

        await axios.patch(`http://localhost:3000/users/${user.id}`, {
          deleted_permanently: true,
          deleted_at: new Date().toISOString(),
          deleted_by: session.username
        });

        loadTrashUsers();
      });
    });
  } catch (err) {
    console.error('Error cargando usuarios eliminados:', err);
  }
}

export function initTrashUsers() {
  loadTrashUsers();
}
