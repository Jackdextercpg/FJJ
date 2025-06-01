// app.js - Arquivo principal da aplicação
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { initClubs } from './clubes.js';
import { initMatches } from './partidas.js';
import { initTable } from './tabela.js';
import { initPlayers } from './jogadores.js';
import { closeAllModals } from './utils.js';

// Inicialização global da aplicação
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa componentes
  initNavigation();
  initMobileMenu();
  
  // Monitora o estado de autenticação
  onAuthStateChanged(auth, (user) => {
    updateUIForAuthState(user);
    
    // Inicializa os módulos da aplicação
    initTable();
    initClubs();
    initMatches();
    initPlayers();
  });
});

// Navegação entre seções
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove a classe active de todos os links
      navLinks.forEach(item => item.classList.remove('active'));
      
      // Adiciona a classe active ao link clicado
      link.classList.add('active');
      
      // Obtém a seção alvo
      const targetSection = link.getAttribute('data-section');
      if (!targetSection) return;
      
      // Esconde todas as seções
      document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
      });
      
      // Mostra a seção alvo
      const targetElement = document.getElementById(targetSection);
      if (targetElement) {
        targetElement.classList.add('active');
      }
      
      // Fecha o menu mobile se estiver aberto
      const mobileMenu = document.querySelector('.main-nav');
      const menuToggle = document.querySelector('.mobile-menu-toggle');
      
      if (mobileMenu?.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        menuToggle?.classList.remove('active');
      }
      
      // Fecha todos os modais
      closeAllModals();
    });
  });
}

// Menu mobile
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.main-nav');
  
  if (!menuToggle || !mobileMenu) return;
  
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
  });
}

// Atualiza a interface com base no estado de autenticação
function updateUIForAuthState(user) {
  const loginButton = document.getElementById('loginButton');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const adminControls = document.querySelectorAll('.admin-controls');
  
  if (!loginButton || !userInfo || !userName) return;
  
  if (user) {
    // Usuário autenticado
    loginButton.classList.add('hidden');
    userInfo.classList.remove('hidden');
    userName.textContent = user.email;
    
    // Mostra os controles de administrador
    adminControls.forEach(control => {
      control.classList.remove('hidden');
    });
    
    console.log('Usuário autenticado:', user.email);
  } else {
    // Usuário não autenticado
    loginButton.classList.remove('hidden');
    userInfo.classList.add('hidden');
    
    // Esconde os controles de administrador
    adminControls.forEach(control => {
      control.classList.add('hidden');
    });
    
    console.log('Nenhum usuário autenticado');
  }
}

// Exporta funções para uso em outros módulos
export { updateUIForAuthState };