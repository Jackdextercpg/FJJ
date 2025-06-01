// tournament.js - Gerenciamento do formato do campeonato
import { db } from './firebase.js';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Formatos disponíveis
export const TOURNAMENT_FORMATS = {
  LEAGUE: 'league', // Pontos corridos
  GROUPS_KNOCKOUT: 'groups_knockout' // Fase de grupos + mata-mata
};

// Inicializa o gerenciamento do torneio
export function initTournamentManagement() {
  const tournamentForm = document.getElementById('tournamentForm');
  if (!tournamentForm) return;

  tournamentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const format = document.querySelector('input[name="format"]:checked')?.value;
    const teamCount = parseInt(document.querySelector('input[name="teamCount"]:checked')?.value);
    
    try {
      const tournament = await setupTournament(format, teamCount);
      console.log('Torneio configurado:', tournament);
    } catch (error) {
      console.error('Erro ao configurar torneio:', error);
    }
  });
}

// Configuração do torneio
export async function setupTournament(format, teamCount) {
  try {
    // Validações
    if (![8, 16, 32].includes(teamCount)) {
      throw new Error('Número de times inválido');
    }

    if (!Object.values(TOURNAMENT_FORMATS).includes(format)) {
      throw new Error('Formato de torneio inválido');
    }

    const tournamentData = {
      id: uuidv4(),
      format,
      teamCount,
      status: 'setup',
      currentPhase: format === TOURNAMENT_FORMATS.LEAGUE ? 'league' : 'groups',
      groups: [],
      matches: [],
      standings: [],
      createdAt: new Date()
    };

    // Se for fase de grupos + mata-mata, cria os grupos
    if (format === TOURNAMENT_FORMATS.GROUPS_KNOCKOUT) {
      const groupCount = teamCount === 32 ? 8 : teamCount === 16 ? 4 : 2;
      const teamsPerGroup = teamCount / groupCount;

      for (let i = 0; i < groupCount; i++) {
        tournamentData.groups.push({
          id: String.fromCharCode(65 + i), // A, B, C, etc.
          teams: [],
          matches: [],
          standings: []
        });
      }
    }

    // Salva a configuração do torneio
    const tournamentRef = await addDoc(collection(db, 'tournaments'), tournamentData);
    return { id: tournamentRef.id, ...tournamentData };
  } catch (error) {
    console.error('Erro ao configurar torneio:', error);
    throw error;
  }
}

// Adiciona um gol a um jogador
export async function addGoalToPlayer(matchId, playerId, quantity = 1) {
  try {
    const playerRef = doc(db, 'jogadores', playerId);
    const playerDoc = await getDocs(playerRef);

    if (!playerDoc.exists()) {
      throw new Error('Jogador não encontrado');
    }

    const player = playerDoc.data();
    const stats = player.estatisticas || { gols: 0, jogos: 0, mediaNotas: 0 };
    stats.gols += quantity;

    await updateDoc(playerRef, { estatisticas: stats });

    // Atualiza a tabela de artilharia
    await updateTopScorers();

    console.log('Gol registrado com sucesso');
  } catch (error) {
    console.error('Erro ao registrar gol:', error);
    throw error;
  }
}

// Busca os artilheiros
export async function getTopScorers() {
  try {
    const jogadoresRef = collection(db, 'jogadores');
    const q = query(jogadoresRef, orderBy('estatisticas.gols', 'desc'), limit(20));
    const snapshot = await getDocs(q);

    const scorers = [];
    snapshot.forEach(doc => {
      const player = { id: doc.id, ...doc.data() };
      if (player.estatisticas?.gols > 0) {
        scorers.push(player);
      }
    });

    return scorers;
  } catch (error) {
    console.error('Erro ao buscar artilheiros:', error);
    return [];
  }
}

// Atualiza a exibição dos artilheiros
export async function updateTopScorers() {
  const container = document.getElementById('topScorersContainer');
  const loading = document.getElementById('artilhariaLoading');
  const empty = document.getElementById('artilhariaEmpty');

  try {
    if (loading) loading.classList.remove('hidden');
    if (container) container.classList.add('hidden');
    if (empty) empty.classList.add('hidden');

    const scorers = await getTopScorers();

    if (!scorers.length) {
      if (loading) loading.classList.add('hidden');
      if (empty) empty.classList.remove('hidden');
      return;
    }

    if (container) {
      container.innerHTML = '';
      scorers.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'scorer-item';
        item.innerHTML = `
          <div class="scorer-rank">${index + 1}º</div>
          <div class="scorer-info">
            <img src="${player.foto || 'https://via.placeholder.com/40'}" alt="${player.nome}" class="scorer-photo">
            <span class="scorer-name">${player.nome}</span>
            <span class="scorer-club">${player.clube?.nome || ''}</span>
          </div>
          <div class="scorer-goals">${player.estatisticas?.gols || 0} gols</div>
        `;
        container.appendChild(item);
      });

      if (loading) loading.classList.add('hidden');
      container.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Erro ao atualizar artilheiros:', error);
    if (loading) loading.classList.add('hidden');
    if (empty) empty.classList.remove('hidden');
  }
}