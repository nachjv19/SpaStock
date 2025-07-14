// 📁 js/trash.js
import axios from 'axios';
import { getUserRole } from './session.js';

const URL = 'http://localhost:3000/tasks';
const USERS_URL = 'http://localhost:3000/users';

export async function loadTrash() {
  const role = getUserRole();
  if (role !== 'admin') {
    location.hash = '#/dashboard';
    return;
  }

  const container = document.querySelector('#trash-list');
  if (!container) return;

  try {
    const { data: tasks } = await axios.get(URL);
    const deletedTasks = tasks.filter(t => t.deleted_at);

    if (deletedTasks.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No hay tareas eliminadas.</p>';
      return;
    }

    container.innerHTML = '';
    deletedTasks.forEach(task => {
      const card = document.createElement('div');
      card.className = 'bg-white p-4 rounded shadow space-y-2';

      card.innerHTML = `
        <h3 class="text-lg font-bold text-gray-800">${task.name}</h3>
        <p class="text-sm text-gray-600">${task.description}</p>
        <p class="text-xs text-gray-400">Asignado a: ${task.assigned_to || 'Nadie'}</p>
        <p class="text-xs text-red-400">Eliminado: ${new Date(task.deleted_at).toLocaleString()}</p>
        <div class="flex justify-end gap-2">
          <button class="restore-task bg-green-600 text-white px-3 py-1 rounded" data-id="${task.id}">Restaurar</button>
          <button class="permanent-delete bg-red-600 text-white px-3 py-1 rounded" data-id="${task.id}">Eliminar definitivamente</button>
        </div>
      `;

      container.appendChild(card);
    });

    // Restaurar tarea
    document.querySelectorAll('.restore-task').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        await axios.patch(`${URL}/${id}`, { deleted_at: null });
        loadTrash();
      });
    });

    // Eliminar definitivamente (con validación de contraseña admin)
    document.querySelectorAll('.permanent-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
          <div class="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 class="text-lg font-bold mb-4">Eliminar permanentemente</h2>
            <p class="mb-2">Esta acción requiere contraseña de administrador.</p>
            <input type="password" id="admin-task-password" placeholder="Contraseña de administrador" class="w-full mb-4 p-2 border border-gray-300 rounded" />
            <div class="flex justify-end space-x-2">
              <button id="cancel-task-modal" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
              <button id="confirm-task-modal" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Confirmar</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('cancel-task-modal').addEventListener('click', () => {
          document.body.removeChild(modal);
        });

        document.getElementById('confirm-task-modal').addEventListener('click', async () => {
          const password = document.getElementById('admin-task-password').value;
          if (!password) return alert('Debes ingresar tu contraseña');

          const session = JSON.parse(localStorage.getItem('session'));
          const { username } = session;

          const { data: result } = await axios.get(`${USERS_URL}?username=${username}&password=${password}&role=admin`);

          if (result.length !== 1) {
            alert('Contraseña incorrecta o no tienes permisos.');
            return;
          }

          await axios.patch(`${URL}/${id}`);
          document.body.removeChild(modal);
          loadTrash();
        });
      });
    });

  } catch (err) {
    container.innerHTML = '<p class="text-red-600">Error al cargar la papelera.</p>';
    console.error('Error al cargar papelera:', err);
  }
}
