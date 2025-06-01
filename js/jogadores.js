import { db, storage } from './firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAllClubs } from './clubes.js';
import { getAllMatches } from './partidas.js';
import { showLoadingIndicator, hideLoadingIndicator, formatDate, formatMoney, showConfirmModal } from './utils.js';

// Inicialização do módulo de jogadores
export function initPlayers() {
  loadPlayers();
  initPlayerModal();
  initAddPlayerButton();
  initClubFilter();
  setupPlayerDetails();
}

// Carrega a lista de jogadores do Firestore
async function loadPlayers(clubFilter = 'all') {
  const jogadoresContainer = document.getElementById('jogadoresContainer');
  const jogadoresLoading = document.getElementById('jogadoresLoading');
  const jogadoresEmpty = document.getElementById('jogadoresEmpty');
  
  try {
    // Mostra loading
    showLoadingIndicator(jogadoresLoading, jogadoresContainer, jogadoresEmpty);
    
    // Consulta os jogadores
    let jogadoresQuery;
    
    if (clubFilter === 'all') {
      jogadoresQuery = query(collection(db, 'jogadores'), orderBy('nome'));
    } else {
      jogadoresQuery = query(
        collection(db, 'jogadores'),
        where('clubeId', '==', clubFilter),
        orderBy('nome')
      );
    }
    
    const querySnapshot = await getDocs(jogadoresQuery);
    
    // Busca informações dos clubes para exibição
    const clubes = await getAllClubs();
    
    // Verifica se há dados
    if (querySnapshot.empty) {
      hideLoadingIndicator(jogadoresLoading, jogadoresEmpty);
      return;
    }
    
    // Limpa o container
    jogadoresContainer.innerHTML = '';
    
    // Adiciona os jogadores ao container
    querySnapshot.forEach((doc) => {
      const jogador = { id: doc.id, ...doc.data() };
      
      // Encontra o clube relacionado
      const clube = clubes.find(c => c.id === jogador.clubeId);
      
      if (clube) {
        jogador.clube = clube;
        
        const jogadorCard = createPlayerCard(jogador);
        jogadoresContainer.appendChild(jogadorCard);
      }
    });
    
    // Esconde loading e mostra resultados
    hideLoadingIndicator(jogadoresLoading);
    jogadoresContainer.classList.remove('hidden');
  } catch (error) {
    console.error('Erro ao carregar jogadores:', error);
    hideLoadingIndicator(jogadoresLoading, jogadoresEmpty);
  }
}

// Cria o card de um jogador
function createPlayerCard(jogador) {
  const card = document.createElement('div');
  card.className = 'player-card';
  
  // Calcula o valor de mercado
  const valorMercado = calcularValorMercado(jogador);
  
  card.innerHTML = `
    <div class="player-card-header">
      <img src="${jogador.foto || 'https://via.placeholder.com/80'}" alt="${jogador.nome}" class="player-photo">
    </div>
    <div class="player-card-body">
      <h3 class="player-name">${jogador.nome}</h3>
      <div class="player-info">
        <span class="player-position">${jogador.posicao}</span>
        <span class="player-age">${jogador.idade} anos</span>
      </div>
      <div class="player-stats">
        <div class="player-stat-item">
          <div class="player-stat-value">${jogador.estatisticas?.jogos || 0}</div>
          <div class="player-stat-label">Jogos</div>
        </div>
        <div class="player-stat-item">
          <div class="player-stat-value">${jogador.estatisticas?.gols || 0}</div>
          <div class="player-stat-label">Gols</div>
        </div>
        <div class="player-stat-item">
          <div class="player-stat-value">${(jogador.estatisticas?.mediaNotas || 0).toFixed(1)}</div>
          <div class="player-stat-label">Média</div>
        </div>
      </div>
      <div class="player-club">
        <img src="${jogador.clube.escudo || 'https://via.placeholder.com/20'}" alt="${jogador.clube.nome}" class="player-club-logo">
        ${jogador.clube.nome}
      </div>
      <div class="player-value">
        ${formatMoney(valorMercado)} FJJDOTY
      </div>
    </div>
    <div class="player-card-footer">
      <button class="btn btn-outline view-player-btn" data-id="${jogador.id}">
        <i class="fas fa-eye"></i> Detalhes
      </button>
      <div class="admin-controls hidden">
        <button class="btn btn-sm btn-secondary edit-player-btn" data-id="${jogador.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-player-btn" data-id="${jogador.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;
  
  // Adiciona event listeners
  card.querySelector('.view-player-btn').addEventListener('click', () => {
    showPlayerDetails(jogador.id);
  });
  
  card.querySelector('.edit-player-btn')?.addEventListener('click', () => {
    openPlayerModalForEdit(jogador);
  });
  
  card.querySelector('.delete-player-btn')?.addEventListener('click', () => {
    showConfirmModal(
      `Tem certeza que deseja excluir o jogador ${jogador.nome}?`,
      () => deletePlayer(jogador.id, jogador.foto)
    );
  });
  
  return card;
}

// Inicializa o modal de jogador
function initPlayerModal() {
  const playerModal = document.getElementById('playerModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const playerForm = document.getElementById('playerForm');
  const playerPhoto = document.getElementById('playerPhoto');
  const photoPreviewImg = document.getElementById('photoPreviewImg');
  const photoPlaceholder = document.getElementById('photoPlaceholder');
  
  // Configuração do preview da imagem
  playerPhoto.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        photoPreviewImg.src = e.target.result;
        photoPreviewImg.classList.remove('hidden');
        photoPlaceholder.classList.add('hidden');
      };
      
      reader.readAsDataURL(e.target.files[0]);
    }
  });
  
  // Carrega os clubes para o select
  loadClubsForSelect();
  
  // Fechar modal
  const closeButtons = playerModal.querySelectorAll('.modal-close, .modal-close-btn');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      modalOverlay.classList.add('hidden');
      playerModal.classList.add('hidden');
      resetPlayerForm();
    });
  });
  
  // Envio do formulário
  playerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const playerId = document.getElementById('playerId').value;
    const playerName = document.getElementById('playerName').value;
    const playerAge = document.getElementById('playerAge').value;
    const playerPosition = document.getElementById('playerPosition').value;
    const playerClub = document.getElementById('playerClub').value;
    const playerPhotoFile = playerPhoto.files[0];
    
    try {
      const submitButton = playerForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
      submitButton.disabled = true;
      
      // Dados do jogador
      const playerData = {
        nome: playerName,
        idade: parseInt(playerAge),
        posicao: playerPosition,
        clubeId: playerClub,
        estatisticas: {
          jogos: 0,
          gols: 0,
          mediaNotas: 0
        }
      };
      
      // Upload da foto se houver um arquivo
      if (playerPhotoFile) {
        const photoPath = `jogadores/${Date.now()}_${playerPhotoFile.name}`;
        const storageRef = ref(storage, photoPath);
        
        await uploadBytes(storageRef, playerPhotoFile);
        const photoUrl = await getDownloadURL(storageRef);
        
        playerData.foto = photoUrl;
      }
      
      // Atualiza ou cria o jogador
      if (playerId) {
        // Se for atualização, não sobrescreve as estatísticas existentes
        delete playerData.estatisticas;
        
        await updateDoc(doc(db, 'jogadores', playerId), playerData);
      } else {
        await addDoc(collection(db, 'jogadores'), playerData);
      }
      
      // Fecha o modal e recarrega a lista
      modalOverlay.classList.add('hidden');
      playerModal.classList.add('hidden');
      loadPlayers(document.getElementById('filterClub').value);
      
      console.log(`Jogador ${playerId ? 'atualizado' : 'adicionado'} com sucesso`);
    } catch (error) {
      console.error('Erro ao salvar jogador:', error);
      const errorElement = document.getElementById('playerError');
      errorElement.textContent = 'Ocorreu um erro ao salvar o jogador.';
      errorElement.classList.remove('hidden');
    } finally {
      const submitButton = playerForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = 'Salvar';
      submitButton.disabled = false;
    }
  });
}

// Inicializa o botão de adicionar jogador
function initAddPlayerButton() {
  const addPlayerButton = document.getElementById('addPlayerButton');
  
  addPlayerButton.addEventListener('click', () => {
    const playerModal = document.getElementById('playerModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    // Limpa o formulário
    resetPlayerForm();
    
    // Atualiza o título do modal
    document.getElementById('playerModalTitle').textContent = 'Adicionar Jogador';
    
    // Exibe o modal
    modalOverlay.classList.remove('hidden');
    playerModal.classList.remove('hidden');
  });
}

// Inicializa o filtro de clubes
function initClubFilter() {
  const filterClub = document.getElementById('filterClub');
  
  // Carrega os clubes para o filtro
  loadClubsForFilter();
  
  filterClub.addEventListener('change', () => {
    loadPlayers(filterClub.value);
  });
}

// Carrega a lista de clubes para o select do formulário
async function loadClubsForSelect() {
  try {
    const clubes = await getAllClubs();
    
    const playerClubSelect = document.getElementById('playerClub');
    
    // Limpa as opções existentes, mantendo a primeira
    playerClubSelect.innerHTML = '<option value="">Selecione o clube</option>';
    
    // Adiciona as opções de clube
    clubes.forEach(clube => {
      const option = document.createElement('option');
      option.value = clube.id;
      option.textContent = clube.nome;
      
      playerClubSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar clubes para select:', error);
  }
}

// Carrega a lista de clubes para o filtro
async function loadClubsForFilter() {
  try {
    const clubes = await getAllClubs();
    
    const filterClub = document.getElementById('filterClub');
    
    // Limpa as opções existentes, mantendo a primeira
    filterClub.innerHTML = '<option value="all">Todos os clubes</option>';
    
    // Adiciona as opções de clube
    clubes.forEach(clube => {
      const option = document.createElement('option');
      option.value = clube.id;
      option.textContent = clube.nome;
      
      filterClub.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar clubes para filtro:', error);
  }
}

// Abre o modal para edição de um jogador
function openPlayerModalForEdit(jogador) {
  const playerModal = document.getElementById('playerModal');
  const modalOverlay = document.getElementById('modalOverlay');
  
  // Preenche o formulário com os dados do jogador
  document.getElementById('playerId').value = jogador.id;
  document.getElementById('playerName').value = jogador.nome;
  document.getElementById('playerAge').value = jogador.idade;
  document.getElementById('playerPosition').value = jogador.posicao;
  document.getElementById('playerClub').value = jogador.clubeId;
  
  // Mostra a foto se existir
  if (jogador.foto) {
    const photoPreviewImg = document.getElementById('photoPreviewImg');
    const photoPlaceholder = document.getElementById('photoPlaceholder');
    
    photoPreviewImg.src = jogador.foto;
    photoPreviewImg.classList.remove('hidden');
    photoPlaceholder.classList.add('hidden');
  }
  
  // Atualiza o título do modal
  document.getElementById('playerModalTitle').textContent = 'Editar Jogador';
  
  // Exibe o modal
  modalOverlay.classList.remove('hidden');
  playerModal.classList.remove('hidden');
}

// Exclui um jogador
async function deletePlayer(playerId, photoUrl) {
  try {
    // Exclui o documento no Firestore
    await deleteDoc(doc(db, 'jogadores', playerId));
    
    // Se houver uma foto, exclui do Storage
    if (photoUrl && photoUrl.includes('firebase')) {
      const photoRef = ref(storage, photoUrl);
      await deleteObject(photoRef);
    }
    
    // Recarrega a lista
    loadPlayers(document.getElementById('filterClub').value);
    
    console.log('Jogador excluído com sucesso');
  } catch (error) {
    console.error('Erro ao excluir jogador:', error);
  }
}

// Reseta o formulário de jogador
function resetPlayerForm() {
  document.getElementById('playerForm').reset();
  document.getElementById('playerId').value = '';
  document.getElementById('photoPreviewImg').classList.add('hidden');
  document.getElementById('photoPlaceholder').classList.remove('hidden');
  document.getElementById('playerError').classList.add('hidden');
}

// Calcula o valor de mercado do jogador
function calcularValorMercado(jogador) {
  const estatisticas = jogador.estatisticas || { gols: 0, mediaNotas: 0 };
  
  // Valores base por posição
  const valorBase = {
    GOL: 1000000,
    ZAG: 1200000,
    LD: 900000,
    LE: 900000,
    VOL: 1300000,
    MC: 1500000,
    MEI: 1800000,
    PE: 2000000,
    PD: 2000000,
    ATA: 2500000,
    CA: 2800000
  }[jogador.posicao] || 1000000;
  
  // Cálculo do valor
  // Fórmula: valor = base + (gols * 100k) + (média_notas * 200k)
  const valorGols = (estatisticas.gols || 0) * 100000;
  const valorNotas = (estatisticas.mediaNotas || 0) * 200000;
  
  return valorBase + valorGols + valorNotas;
}

// Configura a exibição de detalhes do jogador
function setupPlayerDetails() {
  const playerDetailsModal = document.getElementById('playerDetailsModal');
  const modalOverlay = document.getElementById('modalOverlay');
  
  // Fechar modal
  const closeButtons = playerDetailsModal.querySelectorAll('.modal-close');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      modalOverlay.classList.add('hidden');
      playerDetailsModal.classList.add('hidden');
    });
  });
}

// Mostra os detalhes de um jogador
async function showPlayerDetails(playerId) {
  try {
    const playerDoc = await getDocs(doc(db, 'jogadores', playerId));
    
    if (!playerDoc.exists()) {
      console.error('Jogador não encontrado');
      return;
    }
    
    const jogador = { id: playerId, ...playerDoc.data() };
    
    // Busca o clube do jogador
    const clubes = await getAllClubs();
    const clube = clubes.find(c => c.id === jogador.clubeId);
    
    if (!clube) {
      console.error('Clube do jogador não encontrado');
      return;
    }
    
    jogador.clube = clube;
    
    // Busca partidas do jogador
    const partidas = await getAllMatches();
    
    // Preenche os detalhes do jogador no modal
    document.getElementById('playerDetailsName').textContent = jogador.nome;
    document.getElementById('playerDetailsNameFull').textContent = jogador.nome;
    document.getElementById('playerDetailsAge').textContent = jogador.idade;
    document.getElementById('playerDetailsPosition').textContent = jogador.posicao;
    document.getElementById('playerDetailsClub').textContent = clube.nome;
    document.getElementById('playerDetailsPhoto').src = jogador.foto || 'https://via.placeholder.com/120';
    
    // Estatísticas
    document.getElementById('playerDetailsGames').textContent = jogador.estatisticas?.jogos || 0;
    document.getElementById('playerDetailsGoals').textContent = jogador.estatisticas?.gols || 0;
    document.getElementById('playerDetailsRating').textContent = (jogador.estatisticas?.mediaNotas || 0).toFixed(1);
    
    // Valor de mercado
    const valorMercado = calcularValorMercado(jogador);
    document.getElementById('playerDetailsValue').textContent = `${formatMoney(valorMercado)} FJJDOTY`;
    
    // Histórico de partidas (simulado)
    const playerMatchesContainer = document.getElementById('playerMatchesContainer');
    const playerMatchesEmpty = document.getElementById('playerMatchesEmpty');
    
    // Limpa o container
    playerMatchesContainer.innerHTML = '';
    
    // Simula algumas partidas do jogador
    if (partidas.length > 0) {
      // Filtra partidas do clube do jogador
      const partidasDoClube = partidas.filter(p => 
        p.clubeMandanteId === jogador.clubeId || 
        p.clubeVisitanteId === jogador.clubeId
      );
      
      if (partidasDoClube.length > 0) {
        // Mostra as partidas
        partidasDoClube.slice(0, 5).forEach(partida => {
          // Simula performance
          const jogouPartida = Math.random() > 0.2; // 80% de chance de ter jogado
          
          if (jogouPartida && partida.status === 'completed') {
            const gols = Math.floor(Math.random() * 2); // 0 ou 1 gol
            const nota = (Math.random() * 3 + 5).toFixed(1); // Nota entre 5.0 e 8.0
            
            // Cria item de partida
            const partidaItem = createPlayerMatchItem(partida, clube, clubes, gols, nota);
            playerMatchesContainer.appendChild(partidaItem);
          }
        });
        
        playerMatchesContainer.classList.remove('hidden');
        playerMatchesEmpty.classList.add('hidden');
      } else {
        playerMatchesContainer.classList.add('hidden');
        playerMatchesEmpty.classList.remove('hidden');
      }
    } else {
      playerMatchesContainer.classList.add('hidden');
      playerMatchesEmpty.classList.remove('hidden');
    }
    
    // Exibe o modal
    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('playerDetailsModal').classList.remove('hidden');
  } catch (error) {
    console.error('Erro ao mostrar detalhes do jogador:', error);
  }
}

// Cria um item de partida para o histórico do jogador
function createPlayerMatchItem(partida, clubeJogador, clubes, gols, nota) {
  const partidaItem = document.createElement('div');
  partidaItem.className = 'player-match-item';
  
  // Obtém os clubes da partida
  const clubeMandante = clubes.find(c => c.id === partida.clubeMandanteId);
  const clubeVisitante = clubes.find(c => c.id === partida.clubeVisitanteId);
  
  // Formata a data
  const dataFormatada = formatDate(partida.data);
  
  // Determina a classe da nota
  let ratingClass = '';
  if (nota >= 7.5) {
    ratingClass = 'rating-high';
  } else if (nota >= 6.0) {
    ratingClass = 'rating-medium';
  } else {
    ratingClass = 'rating-low';
  }
  
  partidaItem.innerHTML = `
    <div class="player-match-date">
      ${dataFormatada}
    </div>
    <div class="player-match-teams">
      <div class="player-match-team">
        <span>${clubeMandante.abreviacao || clubeMandante.nome}</span>
        <img src="${clubeMandante.escudo || 'https://via.placeholder.com/24'}" alt="${clubeMandante.nome}" class="player-match-team-logo">
      </div>
      <div class="player-match-result">
        ${partida.placar.mandante} x ${partida.placar.visitante}
      </div>
      <div class="player-match-team">
        <img src="${clubeVisitante.escudo || 'https://via.placeholder.com/24'}" alt="${clubeVisitante.nome}" class="player-match-team-logo">
        <span>${clubeVisitante.abreviacao || clubeVisitante.nome}</span>
      </div>
    </div>
    <div class="player-match-stats">
      ${gols > 0 ? `<span class="player-match-goals">${gols} gol${gols > 1 ? 's' : ''}</span>` : ''}
      <span class="player-match-rating ${ratingClass}">${nota}</span>
    </div>
  `;
  
  return partidaItem;
}

// Add new function to get top scorers
export async function getTopScorers() {
  try {
    const jogadoresQuery = query(
      collection(db, 'jogadores'),
      orderBy('estatisticas.gols', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(jogadoresQuery);
    const clubes = await getAllClubs();
    
    const artilheiros = [];
    querySnapshot.forEach((doc) => {
      const jogador = { id: doc.id, ...doc.data() };
      const clube = clubes.find(c => c.id === jogador.clubeId);
      
      if (clube) {
        jogador.clube = clube;
        artilheiros.push(jogador);
      }
    });
    
    return artilheiros;
  } catch (error) {
    console.error('Erro ao buscar artilheiros:', error);
    return [];
  }
}

// Add function to update top scorers display
export async function updateTopScorers() {
  const container = document.getElementById('topScorersContainer');
  const loading = document.getElementById('artilhariaLoading');
  const empty = document.getElementById('artilhariaEmpty');
  
  try {
    showLoadingIndicator(loading, container, empty);
    
    const artilheiros = await getTopScorers();
    
    if (artilheiros.length === 0) {
      hideLoadingIndicator(loading, empty);
      return;
    }
    
    container.innerHTML = '';
    
    artilheiros.forEach((jogador, index) => {
      const item = document.createElement('div');
      item.className = 'scorer-item';
      
      item.innerHTML = `
        <div class="scorer-rank">${index + 1}º</div>
        <div class="scorer-info">
          <img src="${jogador.foto || 'https://via.placeholder.com/40'}" alt="${jogador.nome}" class="scorer-photo">
          <span class="scorer-name">${jogador.nome}</span>
          <span class="scorer-club">${jogador.clube.nome}</span>
        </div>
        <div class="scorer-goals">${jogador.estatisticas?.gols || 0} gols</div>
      `;
      
      container.appendChild(item);
    });
    
    hideLoadingIndicator(loading);
    container.classList.remove('hidden');
  } catch (error) {
    console.error('Erro ao atualizar artilheiros:', error);
    hideLoadingIndicator(loading, empty);
  }
}