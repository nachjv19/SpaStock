export function validatePasswordStrength(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

export function showSuccess(message) {
  renderAlert(message, 'success');
}

export function showError(message) {
  renderAlert(message, 'error');
}

function renderAlert(message, type = 'info') {
  const box = document.createElement('div');
  box.className = `fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded shadow-md text-white ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  }`;
  box.textContent = message;
  document.body.appendChild(box);

  setTimeout(() => box.remove(), 3000);
}
