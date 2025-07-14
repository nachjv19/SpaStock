// 📁 js/api.js
import axios from 'axios';
import { getUserRole, getUsername } from './session.js';

const URL = 'http://localhost:3000/tasks';

export async function loadTasks() {
  const { data: tasks } = await axios.get(URL);

  const container = document.querySelector('#task-list');
  if (!container) return;

  const role = getUserRole();
  const username = getUsername();
  container.innerHTML = '';

  const users = role === 'admin' ? (await axios.get('http://localhost:3000/users?is_active=true')).data : [];

  tasks
    .filter(task => !task.deleted_at)
    .filter(task => role === 'admin' || task.assigned_to === username)
    .forEach(task => {
      const item = document.createElement('div');
      item.className = 'bg-white shadow p-4 rounded space-y-2';

      const isAdmin = role === 'admin';
      const isDone = task.status === 'terminada';

      item.innerHTML = `
        <div class="task-display">
          <h3 class="text-lg font-semibold text-gray-800">${task.name}</h3>
          <p class="text-sm text-gray-600">${task.description}</p>
          ${task.assigned_to ? `<p class="text-xs text-gray-400">Asignado a: ${task.assigned_to}</p>` : ''}
          <label class="text-xs text-gray-500 block">Estado:</label>

          ${
            isAdmin || (!isAdmin && !isDone)
              ? `<select data-id="${task.id}" class="task-status w-full p-2 border border-gray-300 rounded">
                  <option value="pendiente" ${task.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                  <option value="en proceso" ${task.status === 'en proceso' ? 'selected' : ''}>En proceso</option>
                  <option value="terminada" ${task.status === 'terminada' ? 'selected' : ''}>Terminada</option>
                </select>`
              : `<span class="inline-block px-3 py-1 text-sm bg-green-200 text-green-800 rounded">Tarea terminada</span>`
          }

          ${isAdmin || task.assigned_to === username
            ? `<button data-id="${task.id}" class="edit-task bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500 mt-2">Editar</button>`
            : ''}

          ${isAdmin
            ? `<button data-id="${task.id}" class="delete-task bg-red-500 text-white px-3 py-1 rounded mt-2 hover:bg-red-600">Eliminar</button>`
            : ''}
        </div>
      `;

      container.appendChild(item);

      item.querySelector('.edit-task')?.addEventListener('click', () => {
        const display = item.querySelector('.task-display');
        display.innerHTML = `
          <input type="text" value="${task.name}" class="edit-name w-full p-2 border mb-2 rounded" />
          <textarea class="edit-desc w-full p-2 border mb-2 rounded">${task.description}</textarea>
          <select class="edit-status w-full p-2 border mb-2 rounded">
            <option value="pendiente" ${task.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="en proceso" ${task.status === 'en proceso' ? 'selected' : ''}>En proceso</option>
            <option value="terminada" ${task.status === 'terminada' ? 'selected' : ''}>Terminada</option>
          </select>
          ${isAdmin ? `
            <select class="edit-user w-full p-2 border mb-2 rounded">
              ${users.map(u => `<option value="${u.username}" ${task.assigned_to === u.username ? 'selected' : ''}>${u.username}</option>`).join('')}
            </select>` : ''}
          <div class="flex justify-end space-x-2">
            <button class="cancel-edit bg-gray-300 px-3 py-1 rounded">Cancelar</button>
            <button class="save-edit bg-green-600 text-white px-3 py-1 rounded">Guardar</button>
          </div>
        `;

        display.querySelector('.cancel-edit').addEventListener('click', () => loadTasks());

        display.querySelector('.save-edit').addEventListener('click', async () => {
          const updatedTask = {
            name: display.querySelector('.edit-name').value.trim(),
            description: display.querySelector('.edit-desc').value.trim(),
            status: display.querySelector('.edit-status').value,
            updated_at: new Date().toISOString()
          };

          if (isAdmin) {
            updatedTask.assigned_to = display.querySelector('.edit-user').value;
          }

          if (!updatedTask.name || !updatedTask.description) {
            alert('Todos los campos son obligatorios.');
            return;
          }

          await axios.patch(`${URL}/${task.id}`, updatedTask);
          loadTasks();
        });
      });
    });

  document.querySelectorAll('.task-status').forEach(select => {
    select.addEventListener('change', async e => {
      const id = e.target.dataset.id;
      const newStatus = e.target.value;

      const updates = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'terminada') {
        updates.completed_at = new Date().toISOString();
      }

      try {
        await axios.patch(`${URL}/${id}`, updates);
        loadTasks();
      } catch (err) {
        console.error('Error al actualizar estado:', err);
      }
    });
  });

  document.querySelectorAll('.delete-task').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;

      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white p-6 rounded shadow max-w-sm w-full">
          <h2 class="text-lg font-bold mb-4">¿Eliminar tarea?</h2>
          <p class="mb-4">Esta acción enviará la tarea a la papelera.</p>
          <div class="flex justify-end space-x-2">
            <button id="cancel-task-modal" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
            <button id="confirm-task-modal" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Eliminar</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('cancel-task-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
      });

      document.getElementById('confirm-task-modal').addEventListener('click', async () => {
        await axios.patch(`${URL}/${id}`, {
          deleted_at: new Date().toISOString()
        });
        document.body.removeChild(modal);
        loadTasks();
      });
    });
  });
}

export async function initTasks() {
  loadTasks();

  const btn = document.querySelector('#btn-create-task');
  if (!btn) return;

  if (getUserRole() === 'admin') {
    const idContainer = document.querySelector('#id-container');
    if (idContainer) idContainer.classList.remove('hidden');

    const { data: existingTasks } = await axios.get(URL);
    const nextId = Math.max(0, ...existingTasks.map(t => t.id || 0)) + 1;

    const idInput = document.getElementById('task-id');
    if (idInput) idInput.value = nextId;

    btn.dataset.nextId = nextId;

    const container = document.querySelector('#assign-container');
    if (container) {
      const { data: users } = await axios.get('http://localhost:3000/users?is_active=true');

      const select = document.createElement('select');
      select.id = 'task-user';
      select.className = 'w-full p-2 border border-gray-300 rounded';

      users.forEach(user => {
        const opt = document.createElement('option');
        opt.value = user.username;
        opt.textContent = user.username;
        select.appendChild(opt);
      });

      container.innerHTML = '<label class="block mb-1 text-sm">Asignar a:</label>';
      container.appendChild(select);
    }
  }

  btn.addEventListener('click', async () => {
    const name = document.querySelector('#task-name')?.value.trim();
    const description = document.querySelector('#task-desc')?.value.trim();
    const status = document.querySelector('#task-status')?.value;
    const assigned_to = document.querySelector('#task-user')?.value;

    if (!name || !description) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    const{ data: tasks } = await axios.get('http://localhost:3000/tasks');
    const nextId = Math.max(0, ...tasks.map(t => t.id || 0)) + 1;

    const task = {
      id: nextId,
      name,
      description,
      status,
      assigned_to: assigned_to || null,
      created_at: new Date().toISOString(),
      updated_at: null,
      deleted_at: null
    };

    try {
      await axios.post(URL, task);
      document.querySelector('#task-name').value = '';
      document.querySelector('#task-desc').value = '';
      document.querySelector('#task-status').value = 'pendiente';
      loadTasks();
    } catch (err) {
      console.error('Error al guardar la tarea:', err);
    }
  });
}
