// partidas.js - Gerenciamento de partidas

import { db } from './firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { getAllClubs, updateClubStats } from './clubes.js';
import { updateTable } from './tabela.js';
import { showLoadingIndicator, hideLoadingIndicator, formatDate, formatDateTime, showConfirmModal } from './utils.js';

// Inicialização do módulo de partidas
export function initMatches() {
  loadMatches();
  initMatchModal();
  initAddMatchButton();
  initMatchFilter();
}

// Carrega a lista de partidas do Firestore
async function loadMatches(filter = 'all') {
  const partidasContainer = document.getElementById('partidasContainer');
  const partidasLoading = document.getElementById('partidasLoading');
  const partidasEmpty = document.getElementById('partidasEmpty');
  
  try {
    // Mostra loading
    showLoadingIndicator(partidasLoading, partidasContainer, partidasEmpty);
    
    // Consulta as partidas ordenadas por data
    let partidasQuery = query(collection(db, 'partidas'), orderBy('data', 'desc'));
    
    // Aplica filtro se necessário
    if (filter === 'upcoming') {
      partidasQuery = query(
        collection(db, 'partidas'),
        where('status', '==', 'scheduled'),
        orderBy('data')
      );
    } else if (filter === 'completed') {
      partidasQuery = query(
        collection(db, 'partidas'),
        where('status', '==', 'completed'),
        orderBy('data', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(partidasQuery);
    
    // Busca informações dos clubes para exibição
    const clubes = await getAllClubs();
    
    // Verifica se há dados
    if (querySnapshot.empty) {
      hideLoadingIndicator(partidasLoading, partidasEmpty);
      return;
    }
    
    // Limpa o container
    partidasContainer.innerHTML = '';
    
    // Adiciona as partidas ao container
    querySnapshot.forEach((doc) => {
      const partida = { id: doc.id, ...doc.data() };
      
      // Converte Timestamp para Date
      if (partida.data && partida.data instanceof Timestamp) {
        partida.data = partida.data.toDate();
      }
      
      // Encontra os clubes relacionados
      const clubeMandante = clubes.find(c => c.id === partida.clubeMandanteId);
      const clubeVisitante = clubes.find(c => c.id === partida.clubeVisitanteId);
      
      if (clubeMandante && clubeVisitante) {
        partida.clubeMandante = clubeMandante;
        partida.clubeVisitante = clubeVisitante;
        
        const partidaCard = createMatchCard(partida);
        partidasContainer.appendChild(partidaCard);
      }
    });
    
    // Esconde loading e mostra resultados
    hideLoadingIndicator(partidasLoading);
    partidasContainer.classList.remove('hidden');
  } catch (error) {
    console.error('Erro ao carregar partidas:', error);
    hideLoadingIndicator(partidasLoading, partidasEmpty);
  }
}

// Cria o card de uma partida
function createMatchCard(partida) {
  const card = document.createElement('div');
  card.className = 'match-card';
  
  const dataFormatada = formatDateTime(partida.data);
  const statusClass = partida.status === 'completed' ? 'completed' : 'scheduled';
  const statusText = partida.status === 'completed' ? 'Finalizada' : 'Agendada';
  
  card.innerHTML = `
    <div class="match-header">
      <div class="match-date">
        <i class="far fa-calendar-alt"></i> ${dataFormatada}
      </div>
      <div class="match-status ${statusClass}">${statusText}</div>
    </div>
    <div class="match-content">
      <div class="match-team home">
        <div class="match-team-name">${partida.clubeMandante.nome}</div>
        <img src="${partida.clubeMandante.escudo || 'https://via.placeholder.com/36'}" alt="${partida.clubeMandante.nome}" class="match-team-logo">
      </div>
      <div class="match-score">
        ${partida.status === 'completed' 
          ? `${partida.placar.mandante}<span class="match-score-separator">x</span>${partida.placar.visitante}`
          : '<span class="match-score-separator">x</span>'
        }
      </div>
      <div class="match-team away">
        <img src="${partida.clubeVisitante.escudo || 'https://via.placeholder.com/36'}" alt="${partida.clubeVisitante.nome}" class="match-team-logo">
        <div class="match-team-name">${partida.clubeVisitante.nome}</div>
      </div>
    </div>
    <div class="match-actions admin-controls hidden">
      <button class="btn btn-sm btn-secondary edit-match-btn" data-id="${partida.id}">
        <i class="fas fa-edit"></i> Editar
      </button>
      <button class="btn btn-sm btn-danger delete-match-btn" data-id="${partida.id}">
        <i class="fas fa-trash"></i> Excluir
      </button>
    </div>
  `;
  
  // Adiciona event listeners
  card.querySelector('.edit-match-btn')?.addEventListener('click', () => {
    openMatchModalForEdit(partida);
  });
  
  card.querySelector('.delete-match-btn')?.addEventListener('click', () => {
    showConfirmModal(
      `Tem certeza que deseja excluir esta partida?`,
      () => deleteMatch(partida.id)
    );
  });
  
  return card;
}

// Inicializa o modal de partida
function initMatchModal() {
  const matchModal = document.getElementById('matchModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const matchForm = document.getElementById('matchForm');
  const matchStatus = document.getElementById('matchStatus');
  const scoreFields = document.getElementById('scoreFields');
  
  // Exibe ou esconde campos de placar conforme status
  matchStatus.addEventListener('change', () => {
    if (matchStatus.value === 'completed') {
      scoreFields.classList.remove('hidden');
    } else {
      scoreFields.classList.add('hidden');
    }
  });
  
  // Carrega os clubes para os selects
  loadClubsForSelect();
  
  // Fechar modal
  const closeButtons = matchModal.querySelectorAll('.modal-close, .modal-close-btn');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      modalOverlay.classList.add('hidden');
      matchModal.classList.add('hidden');
      resetMatchForm();
    });
  });
  
  // Envio do formulário
  matchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const matchId = document.getElementById('matchId').value;
    const matchDate = document.getElementById('matchDate').value;
    const homeClub = document.getElementById('homeClub').value;
    const awayClub = document.getElementById('awayClub').value;
    const status = document.getElementById('matchStatus').value;
    const homeScore = document.getElementById('homeScore').value;
    const awayScore = document.getElementById('awayScore').value;
    
    // Validações básicas
    if (homeClub === awayClub) {
      const errorElement = document.getElementById('matchError');
      errorElement.textContent = 'O clube mandante e visitante não podem ser o mesmo.';
      errorElement.classList.remove('hidden');
      return;
    }
    
    if (status === 'completed' && (homeScore === '' || awayScore === '')) {
      const errorElement = document.getElementById('matchError');
      errorElement.textContent = 'Para partidas finalizadas, informe o placar.';
      errorElement.classList.remove('hidden');
      return;
    }
    
    try {
      const submitButton = matchForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
      submitButton.disabled = true;
      
      // Dados da partida
      const matchData = {
        data: new Date(matchDate),
        clubeMandanteId: homeClub,
        clubeVisitanteId: awayClub,
        status: status
      };
      
      // Adiciona placar se for uma partida finalizada
      if (status === 'completed') {
        matchData.placar = {
          mandante: parseInt(homeScore),
          visitante: parseInt(awayScore)
        };
      }
      
      let oldMatchData = null;
      
      // Atualiza ou cria a partida
      if (matchId) {
        // Busca dados antigos para comparação
        const matchRef = doc(db, 'partidas', matchId);
        const matchDoc = await getDocs(matchRef);
        if (matchDoc.exists()) {
          oldMatchData = matchDoc.data();
        }
        
        await updateDoc(doc(db, 'partidas', matchId), matchData);
      } else {
        await addDoc(collection(db, 'partidas'), matchData);
      }
      
      // Se for uma partida finalizada, atualiza estatísticas e tabela
      if (status === 'completed') {
        // Abre modal para registrar gols dos jogadores
        const homeTeamPlayers = await getTeamPlayers(homeClub);
        const awayTeamPlayers = await getTeamPlayers(awayClub);

        const goalScorers = await showGoalScorersModal(
          homeTeamPlayers,
          awayTeamPlayers,
          parseInt(homeScore),
          parseInt(awayScore)
        );

        // Registra os gols para cada jogador
        for (const scorer of goalScorers) {
          await addGoalToPlayer(matchId, scorer.playerId, scorer.goals);
        }
        
        await updateStats(homeClub, awayClub, parseInt(homeScore), parseInt(awayScore), oldMatchData);
        await updateTable();
      }
      
      // Fecha o modal e recarrega a lista
      modalOverlay.classList.add('hidden');
      matchModal.classList.add('hidden');
      loadMatches(document.getElementById('filterMatchStatus').value);
      
      console.log(`Partida ${matchId ? 'atualizada' : 'adicionada'} com sucesso`);
    } catch (error) {
      console.error('Erro ao salvar partida:', error);
      const errorElement = document.getElementById('matchError');
      errorElement.textContent = 'Ocorreu um erro ao salvar a partida.';
      errorElement.classList.remove('hidden');
    } finally {
      const submitButton = matchForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = 'Salvar';
      submitButton.disabled = false;
    }
  });
}

// Inicializa o botão de adicionar partida
function initAddMatchButton() {
  const addMatchButton = document.getElementById('addMatchButton');
  
  addMatchButton.addEventListener('click', () => {
    const matchModal = document.getElementById('matchModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    // Limpa o formulário
    resetMatchForm();
    
    // Define a data atual no campo de data
    const now = new Date();
    const localDatetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    document.getElementById('matchDate').value = localDatetime;
    
    // Atualiza o título do modal
    document.getElementById('matchModalTitle').textContent = 'Adicionar Partida';
    
    // Exibe o modal
    modalOverlay.classList.remove('hidden');
    matchModal.classList.remove('hidden');
  });
}

// Inicializa o filtro de partidas
function initMatchFilter() {
  const filterMatchStatus = document.getElementById('filterMatchStatus');
  
  filterMatchStatus.addEventListener('change', () => {
    loadMatches(filterMatchStatus.value);
  });
}

// Carrega a lista de clubes para os selects
async function loadClubsForSelect() {
  try {
    const clubes = await getAllClubs();
    
    const homeClubSelect = document.getElementById('homeClub');
    const awayClubSelect = document.getElementById('awayClub');
    
    // Limpa as opções existentes, mantendo a primeira
    homeClubSelect.innerHTML = '<option value="">Selecione o clube</option>';
    awayClubSelect.innerHTML = '<option value="">Selecione o clube</option>';
    
    // Adiciona as opções de clube
    clubes.forEach(clube => {
      const option = document.createElement('option');
      option.value = clube.id;
      option.textContent = clube.nome;
      
      homeClubSelect.appendChild(option.cloneNode(true));
      awayClubSelect.appendChild(option.cloneNode(true));
    });
  } catch (error) {
    console.error('Erro ao carregar clubes para select:', error);
  }
}

// Abre o modal para edição de uma partida
function openMatchModalForEdit(partida) {
  const matchModal = document.getElementById('matchModal');
  const modalOverlay = document.getElementById('modalOverlay');
  
  // Preenche o formulário com os dados da partida
  document.getElementById('matchId').value = partida.id;
  
  // Formata a data para o input datetime-local
  const localDatetime = new Date(partida.data.getTime() - partida.data.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  document.getElementById('matchDate').value = localDatetime;
  
  document.getElementById('homeClub').value = partida.clubeMandanteId;
  document.getElementById('awayClub').value = partida.clubeVisitanteId;
  document.getElementById('matchStatus').value = partida.status;
  
  // Mostra ou esconde campos de placar conforme status
  const scoreFields = document.getElementById('scoreFields');
  if (partida.status === 'completed') {
    scoreFields.classList.remove('hidden');
    document.getElementById('homeScore').value = partida.placar.mandante;
    document.getElementById('awayScore').value = partida.placar.visitante;
  } else {
    scoreFields.classList.add('hidden');
  }
  
  // Atualiza o título do modal
  document.getElementById('matchModalTitle').textContent = 'Editar Partida';
  
  // Exibe o modal
  modalOverlay.classList.remove('hidden');
  matchModal.classList.remove('hidden');
}

// Exclui uma partida
async function deleteMatch(matchId) {
  try {
    // Exclui o documento no Firestore
    await deleteDoc(doc(db, 'partidas', matchId));
    
    // Recarrega a lista
    loadMatches(document.getElementById('filterMatchStatus').value);
    
    // Atualiza a tabela
    await updateTable();
    
    console.log('Partida excluída com sucesso');
  } catch (error) {
    console.error('Erro ao excluir partida:', error);
  }
}

// Reseta o formulário de partida
function resetMatchForm() {
  document.getElementById('matchForm').reset();
  document.getElementById('matchId').value = '';
  document.getElementById('scoreFields').classList.add('hidden');
  document.getElementById('matchError').classList.add('hidden');
}

// Atualiza as estatísticas dos clubes após uma partida
async function updateStats(homeClubId, awayClubId, homeScore, awayScore, oldMatchData) {
  try {
    // Busca estatísticas atuais dos clubes
    const clubes = await getAllClubs();
    const homeClub = clubes.find(c => c.id === homeClubId);
    const awayClub = clubes.find(c => c.id === awayClubId);
    
    if (!homeClub || !awayClub) {
      console.error('Clubes não encontrados');
      return;
    }
    
    // Inicializa estatísticas se não existirem
    if (!homeClub.estatisticas) {
      homeClub.estatisticas = {
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        golsPro: 0,
        golsContra: 0
      };
    }
    
    if (!awayClub.estatisticas) {
      awayClub.estatisticas = {
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        golsPro: 0,
        golsContra: 0
      };
    }
    
    // Se estamos atualizando uma partida, desfaz as estatísticas anteriores
    if (oldMatchData && oldMatchData.status === 'completed') {
      const oldHomePlacar = oldMatchData.placar.mandante;
      const oldAwayPlacar = oldMatchData.placar.visitante;
      
      // Remove gols
      homeClub.estatisticas.golsPro -= oldHomePlacar;
      homeClub.estatisticas.golsContra -= oldAwayPlacar;
      awayClub.estatisticas.golsPro -= oldAwayPlacar;
      awayClub.estatisticas.golsContra -= oldHomePlacar;
      
      // Remove resultado
      if (oldHomePlacar > oldAwayPlacar) {
        homeClub.estatisticas.vitorias--;
        awayClub.estatisticas.derrotas--;
      } else if (oldHomePlacar < oldAwayPlacar) {
        homeClub.estatisticas.derrotas--;
        awayClub.estatisticas.vitorias--;
      } else {
        homeClub.estatisticas.empates--;
        awayClub.estatisticas.empates--;
      }
    }
    
    // Atualiza gols
    homeClub.estatisticas.golsPro += homeScore;
    homeClub.estatisticas.golsContra += awayScore;
    awayClub.estatisticas.golsPro += awayScore;
    awayClub.estatisticas.golsContra += homeScore;
    
    // Atualiza resultado
    if (homeScore > awayScore) {
      homeClub.estatisticas.vitorias++;
      awayClub.estatisticas.derrotas++;
    } else if (homeScore < awayScore) {
      homeClub.estatisticas.derrotas++;
      awayClub.estatisticas.vitorias++;
    } else {
      homeClub.estatisticas.empates++;
      awayClub.estatisticas.empates++;
    }
    
    // Salva as estatísticas atualizadas
    await updateClubStats(homeClubId, homeClub.estatisticas);
    await updateClubStats(awayClubId, awayClub.estatisticas);
    
    console.log('Estatísticas atualizadas com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
  }
}

// Exporta funções necessárias
export async function getAllMatches() {
  try {
    const partidasQuery = query(collection(db, 'partidas'), orderBy('data', 'desc'));
    const querySnapshot = await getDocs(partidasQuery);
    
    const partidas = [];
    querySnapshot.forEach((doc) => {
      const partida = { id: doc.id, ...doc.data() };
      
      // Converte Timestamp para Date
      if (partida.data && partida.data instanceof Timestamp) {
        partida.data = partida.data.toDate();
      }
      
      partidas.push(partida);
    });
    
    return partidas;
  } catch (error) {
    console.error('Erro ao buscar partidas:', error);
    return [];
  }
}

// Função para mostrar modal de seleção de artilheiros
async function showGoalScorersModal(homePlayers, awayPlayers, homeScore, awayScore) {
  return new Promise((resolve) => {
    const modalContent = `
      <div class="modal-header">
        <h3>Registrar Gols</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="team-scorers">
          <h4>Time Mandante (${homeScore} gols)</h4>
          <div class="scorers-list" id="homeScorers">
            ${homePlayers.map(player => `
              <div class="scorer-input">
                <label>${player.nome}</label>
                <input type="number" min="0" max="${homeScore}" value="0" 
                  data-player-id="${player.id}" class="form-control">
              </div>
            `).join('')}
          </div>
        </div>
        <div class="team-scorers">
          <h4>Time Visitante (${awayScore} gols)</h4>
          <div class="scorers-list" id="awayScorers">
            ${awayPlayers.map(player => `
              <div class="scorer-input">
                <label>${player.nome}</label>
                <input type="number" min="0" max="${awayScore}" value="0" 
                  data-player-id="${player.id}" class="form-control">
              </div>
            `).join('')}
          </div>
        </div>
        <div class="form-error hidden" id="scorersError"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" id="saveScorers">Salvar</button>
        </div>
      </div>
    `;

    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal';
    modalDiv.innerHTML = modalContent;

    document.getElementById('modalOverlay').appendChild(modalDiv);

    const saveButton = modalDiv.querySelector('#saveScorers');
    saveButton.addEventListener('click', () => {
      const scorers = [];
      let homeTotal = 0;
      let awayTotal = 0;

      // Coleta gols do time mandante
      modalDiv.querySelectorAll('#homeScorers input').forEach(input => {
        const goals = parseInt(input.value) || 0;
        if (goals > 0) {
          scorers.push({
            playerId: input.dataset.playerId,
            goals: goals
          });
          homeTotal += goals;
        }
      });

      // Coleta gols do time visitante
      modalDiv.querySelectorAll('#awayScorers input').forEach(input => {
        const goals = parseInt(input.value) || 0;
        if (goals > 0) {
          scorers.push({
            playerId: input.dataset.playerId,
            goals: goals
          });
          awayTotal += goals;
        }
      });

      // Valida totais
      if (homeTotal !== homeScore || awayTotal !== awayScore) {
        const error = document.getElementById('scorersError');
        error.textContent = 'O total de gols não corresponde ao placar da partida';
        error.classList.remove('hidden');
        return;
      }

      modalDiv.remove();
      resolve(scorers);
    });
  });
}

// Função auxiliar para buscar jogadores de um time
async function getTeamPlayers(teamId) {
  const playersQuery = query(
    collection(db, 'jogadores'),
    where('clubeId', '==', teamId)
  );
  const snapshot = await getDocs(playersQuery);
  
  const players = [];
  snapshot.forEach(doc => {
    players.push({ id: doc.id, ...doc.data() });
  });
  
  return players;
}