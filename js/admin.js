// admin.js - Gerenciamento do painel administrativo
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { initTournamentManagement } from './tournament.js';
import { closeAllModals } from './utils.js';

// Inicialização do painel administrativo
document.addEventListener('DOMContentLoaded', () => {
  // Verifica autenticação
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = '/index.html';
      return;
    }

    initAdminPanel(user);
  });
});

// Inicializa o painel administrativo
function initAdminPanel(user) {
  // Atualiza informações do usuário
  document.getElementById('userName').textContent = user.email;

  // Inicializa componentes
  initNavigation();
  initTournamentManagement();
  loadDashboard();
}

// Inicializa a navegação
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
      
      // Esconde todas as seções
      document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
      });
      
      // Mostra a seção alvo
      document.getElementById(targetSection).classList.add('active');
      
      // Fecha todos os modais
      closeAllModals();
    });
  });
}

// Carrega o dashboard
async function loadDashboard() {
  try {
    // Carrega informações do campeonato atual
    const currentTournament = await getCurrentTournament();
    updateCurrentTournamentCard(currentTournament);

    // Carrega próximas partidas
    const upcomingMatches = await getUpcomingMatches();
    updateUpcomingMatchesCard(upcomingMatches);

    // Carrega artilheiros
    const topScorers = await getTopScorers();
    updateTopScorersCard(topScorers);
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  }
}

// Atualiza o card do campeonato atual
function updateCurrentTournamentCard(tournament) {
  const container = document.getElementById('currentTournament');
  
  if (!tournament) {
    container.innerHTML = `
      <p class="empty-state-small">Nenhum campeonato em andamento</p>
      <button class="btn btn-primary btn-sm" onclick="document.querySelector('[data-section=tournament]').click()">
        Criar Campeonato
      </button>
    `;
    return;
  }

  container.innerHTML = `
    <div class="tournament-info">
      <p><strong>Formato:</strong> ${tournament.format === 'league' ? 'Pontos Corridos' : 'Grupos + Mata-mata'}</p>
      <p><strong>Times:</strong> ${tournament.teamCount}</p>
      <p><strong>Fase Atual:</strong> ${formatPhase(tournament.currentPhase)}</p>
    </div>
  `;
}

// Atualiza o card de próximas partidas
function updateUpcomingMatchesCard(matches) {
  const container = document.getElementById('upcomingMatches');
  
  if (!matches || matches.length === 0) {
    container.innerHTML = '<p class="empty-state-small">Nenhuma partida agendada</p>';
    return;
  }

  container.innerHTML = matches.slice(0, 3).map(match => `
    <div class="upcoming-match">
      <div class="match-date">${formatDateTime(match.date)}</div>
      <div class="match-teams">
        ${match.homeTeam} x ${match.awayTeam}
      </div>
    </div>
  `).join('');
}

// Atualiza o card de artilheiros
function updateTopScorersCard(scorers) {
  const container = document.getElementById('topScorers');
  
  if (!scorers || scorers.length === 0) {
    container.innerHTML = '<p class="empty-state-small">Nenhum artilheiro registrado</p>';
    return;
  }

  container.innerHTML = scorers.slice(0, 5).map((scorer, index) => `
    <div class="top-scorer">
      <span class="position">${index + 1}º</span>
      <span class="name">${scorer.name}</span>
      <span class="goals">${scorer.goals} gols</span>
    </div>
  `).join('');
}

// Formata a fase do campeonato
function formatPhase(phase) {
  const phases = {
    'league': 'Pontos Corridos',
    'groups': 'Fase de Grupos',
    'round_of_16': 'Oitavas de Final',
    'quarter_finals': 'Quartas de Final',
    'semi_finals': 'Semi-finais',
    'final': 'Final'
  };

  return phases[phase] || phase;
}