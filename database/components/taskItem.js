import axios from 'axios';
import { showSuccess, showError } from "../js/validator.js";

const API = 'http://localhost:3000/tasks';

export function createTaskItem(task, role, reloadCallback) {
    const li = document.createElement('li');
    li.className = 'task-item';

    li.innerHTML = `
    <input type="checkbox" ${task.status === 'completada' ? 'checked' : ''}>
    <span contenteditable>${task.title}</span>
    ${role === 'admin' ? '<button class="delete">🗑</button>' : ''}
  `;

  li.querySelector('input').onchange = async () => {
    try {
        await axios.patch(`${API}/${task.id}`, {
        status: task.status === 'pendiente' ? 'completada' : 'pendiente'
      });

      showSuccess('Estado actualizado');
      reloadCallback();
    } catch {
        showError('Error al actualizar estado');
    }
  };
   
  if(role === 'admin'){
      li.querySelector('.delete').onclick = async () => {
        try {
            await axios.delete(`${API}/${task.id}`);
            showSuccess('Tarea eliminada');
            reloadCallback();
        } catch {
            showError('Error al eliminar tarea');
        }
      };
    }

    return li;
}