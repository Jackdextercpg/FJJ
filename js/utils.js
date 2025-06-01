// utils.js - Funções utilitárias

// Formata um valor monetário
export function formatMoney(value) {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

// Formata uma data (DD/MM/YYYY)
export function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Formata uma data e hora (DD/MM/YYYY HH:MM)
export function formatDateTime(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Mostra o indicador de loading e esconde os containers
export function showLoadingIndicator(loadingElement, contentContainer, emptyElement) {
  if (loadingElement) {
    loadingElement.classList.remove('hidden');
  }
  
  if (contentContainer) {
    contentContainer.classList.add('hidden');
  }
  
  if (emptyElement) {
    emptyElement.classList.add('hidden');
  }
}

// Esconde o indicador de loading e mostra o container apropriado
export function hideLoadingIndicator(loadingElement, emptyElement) {
  if (loadingElement) {
    loadingElement.classList.add('hidden');
  }
  
  if (emptyElement) {
    emptyElement.classList.remove('hidden');
  }
}

// Fecha todos os modais
export function closeAllModals() {
  const modalOverlay = document.getElementById('modalOverlay');
  const modals = document.querySelectorAll('.modal');
  
  modalOverlay.classList.add('hidden');
  modals.forEach(modal => {
    modal.classList.add('hidden');
  });
}

// Mostra o modal de confirmação
export function showConfirmModal(message, confirmCallback) {
  const confirmModal = document.getElementById('confirmModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const confirmMessage = document.getElementById('confirmMessage');
  const confirmAction = document.getElementById('confirmAction');
  const cancelConfirm = document.getElementById('cancelConfirm');
  
  // Define a mensagem
  confirmMessage.textContent = message;
  
  // Configura os botões
  confirmAction.onclick = () => {
    confirmCallback();
    modalOverlay.classList.add('hidden');
    confirmModal.classList.add('hidden');
  };
  
  cancelConfirm.onclick = () => {
    modalOverlay.classList.add('hidden');
    confirmModal.classList.add('hidden');
  };
  
  // Configura o botão de fechar
  const closeButton = confirmModal.querySelector('.modal-close');
  closeButton.onclick = () => {
    modalOverlay.classList.add('hidden');
    confirmModal.classList.add('hidden');
  };
  
  // Exibe o modal
  modalOverlay.classList.remove('hidden');
  confirmModal.classList.remove('hidden');
}

// Exporta funções utilitárias
export default {
  formatMoney,
  formatDate,
  formatDateTime,
  showLoadingIndicator,
  hideLoadingIndicator,
  closeAllModals,
  showConfirmModal
};