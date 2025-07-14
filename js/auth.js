// 📁 auth.js
import axios from 'axios';
import { showError, showSuccess } from './validator.js';
import { setSession, getUserRole } from './session.js';

export async function registerUser() {
  const first_name = document.getElementById('first_name')?.value.trim();
  const last_name = document.getElementById('last_name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const username = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value.trim();
  const role = document.getElementById('role')?.value || 'user';

  if (!first_name || !last_name || !email || !phone || !username || !password) {
    showError('Todos los campos son obligatorios.');
    return;
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    showError('El teléfono debe contener exactamente 10 dígitos.');
    return;
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*()_+]/.test(password)) {
    showError('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.');
    return;
  }

  try {
    const { data: existing } = await axios.get(`http://localhost:3000/users?username=${username}`);
    if (existing.length > 0) {
      showError('El nombre de usuario ya está en uso.');
      return;
    }

    const { data: users } = await axios.get('http://localhost:3000/users');
    const nextId = Math.max(0, ...users.map(u => u.id || 0)) + 1;

    const session = JSON.parse(localStorage.getItem('session'));
    const isAdmin = session?.role === 'admin';

    const newUser = {
      id: String(nextId),
      first_name,
      last_name,
      email,
      phone,
      username,
      password,
      role: isAdmin ? role : 'user',
      is_active: true,
      deleted_at: null
    };

    await axios.post('http://localhost:3000/users', newUser);
    showSuccess('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');

    setTimeout(() => {
      location.hash = '#/login';
    }, 1500);

  } catch (err) {
    console.error('Error en el registro:', err);
    showError('Hubo un error al registrar el usuario.');
  }
}

export function initRegister() {
  const form = document.getElementById('register-form');
  if (!form) return;

  const roleGroup = document.getElementById('role')?.parentElement;
  if (getUserRole() !== 'admin' && roleGroup) {
    roleGroup.classList.add('hidden');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await registerUser();
  });
}

export async function loginUser() {
  const username = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value.trim();

  if (!username || !password) {
    showError('Debes ingresar usuario y contraseña.');
    return;
  }

  try {
    const { data: users } = await axios.get(`http://localhost:3000/users?username=${username}&password=${password}&is_active=true`);

    if (users.length === 1) {
      setSession(users[0]);
      showSuccess('Inicio de sesión exitoso');
      setTimeout(() => {
        location.hash = '#/dashboard';
      }, 1000);
    } else {
      showError('Credenciales inválidas o usuario inactivo.');
    }

  } catch (err) {
    console.error('Error en login:', err);
    showError('Error al iniciar sesión.');
  }
}

export function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await loginUser();
  });
}
