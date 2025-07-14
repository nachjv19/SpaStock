import axios from 'axios';
import { getUsername, getUserRole } from './session.js';

export async function loadTrashTasks() {
  const container = document.querySelector('#trash-tasks');
  if (!container) return;

  try {
    const { data: tasks } = await axios.get('http://localhost:3000/tasks?deleted_at_ne=null');
    container.innerHTML = '';

    tasks.forEach(task => {
      const card = document.createElement('div');
      card.className = 'bg-gray-100 shadow p-4 rounded mb-4';

      card.innerHTML = `
        <h3 class="font-semibold text-gray-800">${task.name}</h3>
        <p class="text-sm text-gray-600">${task.description}</p>
        <p class="text-sm text-gray-500">Estado: ${task.status}</p>
        <p class="text-sm text-gray-500">Eliminada por: ${task.deleted_by || 'N/A'}</p>

        <div class="mt-3 space-x-2">
          ${
            !task.deleted_permanently
              ? `<button class="restore-task bg-green-600 text-white px-3 py-1 rounded" data-id="${task.id}">Restaurar</button>
                 <button class="force-delete-task bg-red-600 text-white px-3 py-1 rounded" data-id="${task.id}">Eliminar definitivamente</button>`
              : `<span class="text-red-600 text-sm">Tarea eliminada permanentemente</span>`
          }
        </div>
      `;

      container.appendChild(card);

      // Restaurar tarea
      card.querySelector('.restore-task')?.addEventListener('click', async () => {
        await axios.patch(`http://localhost:3000/tasks/${task.id}`, {
          deleted_at: null,
          deleted_permanently: false,
          deleted_by: null
        });
        loadTrashTasks();
      });

      // Eliminar definitivamente con validación
      card.querySelector('.force-delete-task')?.addEventListener('click', async () => {
        const confirmDelete = confirm('¿Estás seguro de que quieres eliminar esta tarea definitivamente?');
        if (!confirmDelete) return;

        const password = prompt('Introduce la contraseña de administrador para confirmar:');
        const session = JSON.parse(localStorage.getItem('session'));

        if (!password || password !== session.password || session.role !== 'admin') {
          alert('Contraseña incorrecta o permisos insuficientes.');
          return;
        }

        await axios.patch(`http://localhost:3000/tasks/${task.id}`, {
          deleted_permanently: true,
          deleted_at: new Date().toISOString(),
          deleted_by: session.username
        });

        loadTrashTasks();
      });
    });
  } catch (err) {
    console.error('Error al cargar tareas eliminadas:', err);
  }
}

export function initTrashTasks() {
  loadTrashTasks();
}
