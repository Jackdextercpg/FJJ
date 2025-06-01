// auth.js - Gerenciamento de autenticação
import { auth } from './firebase.js';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { updateUIForAuthState } from './app.js';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initLoginButton();
  initLogoutButton();
  initLoginForm();
});

// Inicializa o botão de login
function initLoginButton() {
  const loginButton = document.getElementById('loginButton');
  const loginModal = document.getElementById('loginModal');
  const modalOverlay = document.getElementById('modalOverlay');
  
  if (!loginButton || !loginModal || !modalOverlay) return;
  
  loginButton.addEventListener('click', () => {
    modalOverlay.classList.remove('hidden');
    loginModal.classList.remove('hidden');
  });
  
  // Configura o fechamento do modal
  const closeButtons = loginModal.querySelectorAll('.modal-close, .modal-close-btn');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      modalOverlay.classList.add('hidden');
      loginModal.classList.add('hidden');
      clearLoginForm();
    });
  });
}

// Inicializa o botão de logout
function initLogoutButton() {
  const logoutButton = document.getElementById('logoutButton');
  
  if (!logoutButton) return;
  
  logoutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      console.log('Usuário desconectado com sucesso');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  });
}

// Inicializa o formulário de login
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  
  if (!loginForm || !loginError) return;
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    
    // Reset de erro anterior
    loginError.classList.add('hidden');
    
    try {
      // Verifica a senha
      if (password !== 'fjj123') {
        throw new Error('auth/wrong-password');
      }
      
      // Mostra indicador de loading
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
      submitButton.disabled = true;
      
      // Login anônimo para admin
      await signInWithEmailAndPassword(auth, 'admin@example.com', 'fjj123');
      
      // Fecha o modal de login
      document.getElementById('modalOverlay').classList.add('hidden');
      document.getElementById('loginModal').classList.add('hidden');
      
      clearLoginForm();
      console.log('Login realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      // Mostra mensagem de erro
      loginError.textContent = 'Senha incorreta.';
      loginError.classList.remove('hidden');
      
      // Restaura o botão
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = 'Entrar';
      submitButton.disabled = false;
    }
  });
}

// Limpa o formulário de login
function clearLoginForm() {
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  
  if (loginForm) loginForm.reset();
  if (loginError) loginError.classList.add('hidden');
}

// Exporta funções necessárias
export { initLoginButton, initLogoutButton };