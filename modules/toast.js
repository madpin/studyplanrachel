/**
 * Toast Module
 * Provides toast notifications to replace alert() calls
 */

let toastContainer = null;

// Initialize toast container
function initToastContainer() {
  if (toastContainer) return;
  
  toastContainer = document.createElement('div');
  toastContainer.id = 'toastContainer';
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in ms (default 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
  initToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  
  const icon = getToastIcon(type);
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Animate in
  setTimeout(() => toast.classList.add('toast--show'), 10);
  
  // Auto remove
  setTimeout(() => {
    toast.classList.remove('toast--show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Show a success toast
 * @param {string} message
 */
export function showSuccess(message) {
  showToast(message, 'success');
}

/**
 * Show an error toast
 * @param {string} message
 */
export function showError(message) {
  showToast(message, 'error', 5000); // Errors stay longer
}

/**
 * Show a warning toast
 * @param {string} message
 */
export function showWarning(message) {
  showToast(message, 'warning', 4000);
}

/**
 * Show an info toast
 * @param {string} message
 */
export function showInfo(message) {
  showToast(message, 'info');
}

/**
 * Show a confirmation dialog with toast-style UI
 * @param {string} message
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Optional callback when cancelled
 */
export function showConfirm(message, onConfirm, onCancel = null) {
  const overlay = document.createElement('div');
  overlay.className = 'toast-confirm-overlay';
  
  const dialog = document.createElement('div');
  dialog.className = 'toast-confirm-dialog';
  dialog.innerHTML = `
    <div class="toast-confirm-message">${message}</div>
    <div class="toast-confirm-actions">
      <button class="btn btn--outline toast-confirm-cancel">Cancel</button>
      <button class="btn btn--primary toast-confirm-ok">Confirm</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Animate in
  setTimeout(() => overlay.classList.add('show'), 10);
  
  const remove = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  };
  
  dialog.querySelector('.toast-confirm-ok').onclick = () => {
    remove();
    if (onConfirm) onConfirm();
  };
  
  dialog.querySelector('.toast-confirm-cancel').onclick = () => {
    remove();
    if (onCancel) onCancel();
  };
  
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      remove();
      if (onCancel) onCancel();
    }
  };
}

function getToastIcon(type) {
  switch (type) {
    case 'success': return '✓';
    case 'error': return '✕';
    case 'warning': return '⚠';
    case 'info': return 'ℹ';
    default: return 'ℹ';
  }
}

