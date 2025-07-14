// 📁 admin.js
import axios from 'axios';
import { getUserRole, getUsername } from './session.js';

export async function loadAdminUsers() {
  const container = document.querySelector('#admin-users');
  if (!container) {
    console.error('❌ No se encontró el contenedor #admin-users');
    return;
  }

  if (getUserRole() !== 'admin') {
    container.innerHTML = '<p class="text-red-600">Acceso restringido</p>';
    return;
  }

  try {
    const { data: users } = await axios.get('http://localhost:3000/users?is_active=true');
    console.log('Usuarios cargados:', users);

    container.innerHTML = '';

    users.forEach(user => {
      const card = document.createElement('div');
      card.className = 'bg-white shadow p-4 rounded flex flex-col gap-2 mb-4';

      card.innerHTML = `
        <div>
          <h3 class="font-bold text-gray-800">${user.username}</h3>
          <p class="text-sm text-gray-600">Rol: ${user.role}</p>
        </div>
        <div class="flex gap-2">
          <button class="info-btn bg-red-600 text-white px-3 py-1 rounded" data-id="${user.id}">Info</button>
          <button class="delete-btn bg-red-600 text-white px-3 py-1 rounded" data-id="${user.id}">Eliminar</button>
        </div>
      `;

      container.appendChild(card);
      console.log('Añadido usuario:', user.username);

      card.querySelector('.info-btn')?.addEventListener('click', async () => {
        const { data: fullUser } = await axios.get(`http://localhost:3000/users/${String(user.id)}`);
        alert(`🧾 Información del usuario:\n\nNombre: ${fullUser.first_name} ${fullUser.last_name}\nCorreo: ${fullUser.email}\nTeléfono: ${fullUser.phone}\nRol: ${fullUser.role}`);
      });

      card.querySelector('.delete-btn')?.addEventListener('click', async () => {
        const confirmDelete = confirm('¿Deseas mover este usuario a la papelera?');
        if (!confirmDelete) return;

        await axios.patch(`http://localhost:3000/users/${user.id}`, {
          is_active: false,
          deleted_at: new Date().toISOString(),
          deleted_by: getUsername()
        });

        loadAdminUsers();
      });
    });
  } catch (err) {
    console.error('Error cargando usuarios admin:', err);
  }
}

export function initAdminUsers() {
  loadAdminUsers();
} 
