// clubes.js - Gerenciamento de clubes

import { db, storage } from './firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { showLoadingIndicator, hideLoadingIndicator, formatDate, showConfirmModal } from './utils.js';

// Inicialização do módulo de clubes
export function initClubs() {
  loadClubs();
  initClubModal();
  initAddClubButton();
}

// Carrega a lista de clubes do Firestore
async function loadClubs() {
  const clubesContainer = document.getElementById('clubesContainer');
  const clubesLoading = document.getElementById('clubesLoading');
  const clubesEmpty = document.getElementById('clubesEmpty');
  
  try {
    // Mostra loading
    showLoadingIndicator(clubesLoading, clubesContainer, clubesEmpty);
    
    // Consulta os clubes ordenados por nome
    const clubesQuery = query(collection(db, 'clubes'), orderBy('nome'));
    const querySnapshot = await getDocs(clubesQuery);
    
    // Verifica se há dados
    if (querySnapshot.empty) {
      hideLoadingIndicator(clubesLoading, clubesEmpty);
      return;
    }
    
    // Limpa o container
    clubesContainer.innerHTML = '';
    
    // Adiciona os clubes ao container
    querySnapshot.forEach((doc) => {
      const clube = { id: doc.id, ...doc.data() };
      const clubeCard = createClubCard(clube);
      clubesContainer.appendChild(clubeCard);
    });
    
    // Esconde loading e mostra resultados
    hideLoadingIndicator(clubesLoading);
    clubesContainer.classList.remove('hidden');
  } catch (error) {
    console.error('Erro ao carregar clubes:', error);
    hideLoadingIndicator(clubesLoading, clubesEmpty);
  }
}

// Cria o card de um clube
function createClubCard(clube) {
  const card = document.createElement('div');
  card.className = 'club-card';
  
  const clubStats = {
    vitórias: clube.estatisticas?.vitorias || 0,
    empates: clube.estatisticas?.empates || 0,
    derrotas: clube.estatisticas?.derrotas || 0
  };
  
  card.innerHTML = `
    <div class="club-card-header">
      <img src="${clube.escudo || 'https://via.placeholder.com/80'}" alt="${clube.nome}" class="club-logo">
      <h3 class="club-name">${clube.nome}</h3>
      <div class="club-foundation">Fundado em ${clube.anoFundacao}</div>
    </div>
    <div class="club-card-body">
      <div class="club-stats">
        <div class="club-stat-item">
          <div class="club-stat-value">${clubStats.vitórias}</div>
          <div class="club-stat-label">Vitórias</div>
        </div>
        <div class="club-stat-item">
          <div class="club-stat-value">${clubStats.empates}</div>
          <div class="club-stat-label">Empates</div>
        </div>
        <div class="club-stat-item">
          <div class="club-stat-value">${clubStats.derrotas}</div>
          <div class="club-stat-label">Derrotas</div>
        </div>
      </div>
    </div>
    <div class="club-card-footer">
      <button class="btn btn-outline view-club-btn" data-id="${clube.id}">
        <i class="fas fa-eye"></i> Detalhes
      </button>
      <div class="admin-controls hidden">
        <button class="btn btn-sm btn-secondary edit-club-btn" data-id="${clube.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-club-btn" data-id="${clube.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;
  
  // Adiciona event listeners
  card.querySelector('.edit-club-btn')?.addEventListener('click', () => {
    openClubModalForEdit(clube);
  });
  
  card.querySelector('.delete-club-btn')?.addEventListener('click', () => {
    showConfirmModal(
      `Tem certeza que deseja excluir o clube ${clube.nome}?`,
      () => deleteClub(clube.id, clube.escudo)
    );
  });
  
  return card;
}

// Inicializa o modal de clube
function initClubModal() {
  const clubModal = document.getElementById('clubModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const clubForm = document.getElementById('clubForm');
  const clubLogo = document.getElementById('clubLogo');
  const logoPreviewImg = document.getElementById('logoPreviewImg');
  const logoPlaceholder = document.getElementById('logoPlaceholder');
  
  // Configuração do preview da imagem
  clubLogo.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        logoPreviewImg.src = e.target.result;
        logoPreviewImg.classList.remove('hidden');
        logoPlaceholder.classList.add('hidden');
      };
      
      reader.readAsDataURL(e.target.files[0]);
    }
  });
  
  // Fechar modal
  const closeButtons = clubModal.querySelectorAll('.modal-close, .modal-close-btn');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      modalOverlay.classList.add('hidden');
      clubModal.classList.add('hidden');
      resetClubForm();
    });
  });
  
  // Envio do formulário
  clubForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const clubId = document.getElementById('clubId').value;
    const clubName = document.getElementById('clubName').value;
    const clubAbbreviation = document.getElementById('clubAbbreviation').value;
    const clubFoundationYear = document.getElementById('clubFoundationYear').value;
    const clubLogoFile = clubLogo.files[0];
    
    try {
      const submitButton = clubForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
      submitButton.disabled = true;
      
      // Dados do clube
      const clubData = {
        nome: clubName,
        abreviacao: clubAbbreviation,
        anoFundacao: parseInt(clubFoundationYear),
        estatisticas: {
          vitorias: 0,
          empates: 0,
          derrotas: 0,
          golsPro: 0,
          golsContra: 0
        }
      };
      
      // Upload do escudo se houver um arquivo
      if (clubLogoFile) {
        const logoPath = `escudos/${Date.now()}_${clubLogoFile.name}`;
        const storageRef = ref(storage, logoPath);
        
        await uploadBytes(storageRef, clubLogoFile);
        const logoUrl = await getDownloadURL(storageRef);
        
        clubData.escudo = logoUrl;
      }
      
      // Atualiza ou cria o clube
      if (clubId) {
        // Se for atualização, não sobrescreve as estatísticas existentes
        delete clubData.estatisticas;
        
        await updateDoc(doc(db, 'clubes', clubId), clubData);
      } else {
        await addDoc(collection(db, 'clubes'), clubData);
      }
      
      // Fecha o modal e recarrega a lista
      modalOverlay.classList.add('hidden');
      clubModal.classList.add('hidden');
      loadClubs();
      
      console.log(`Clube ${clubId ? 'atualizado' : 'adicionado'} com sucesso`);
    } catch (error) {
      console.error('Erro ao salvar clube:', error);
      const errorElement = document.getElementById('clubError');
      errorElement.textContent = 'Ocorreu um erro ao salvar o clube.';
      errorElement.classList.remove('hidden');
    } finally {
      const submitButton = clubForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = 'Salvar';
      submitButton.disabled = false;
    }
  });
}

// Inicializa o botão de adicionar clube
function initAddClubButton() {
  const addClubButton = document.getElementById('addClubButton');
  
  addClubButton.addEventListener('click', () => {
    const clubModal = document.getElementById('clubModal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    // Limpa o formulário
    resetClubForm();
    
    // Atualiza o título do modal
    document.getElementById('clubModalTitle').textContent = 'Adicionar Clube';
    
    // Exibe o modal
    modalOverlay.classList.remove('hidden');
    clubModal.classList.remove('hidden');
  });
}

// Abre o modal para edição de um clube
function openClubModalForEdit(clube) {
  const clubModal = document.getElementById('clubModal');
  const modalOverlay = document.getElementById('modalOverlay');
  
  // Preenche o formulário com os dados do clube
  document.getElementById('clubId').value = clube.id;
  document.getElementById('clubName').value = clube.nome;
  document.getElementById('clubAbbreviation').value = clube.abreviacao;
  document.getElementById('clubFoundationYear').value = clube.anoFundacao;
  
  // Mostra a imagem do escudo se existir
  if (clube.escudo) {
    const logoPreviewImg = document.getElementById('logoPreviewImg');
    const logoPlaceholder = document.getElementById('logoPlaceholder');
    
    logoPreviewImg.src = clube.escudo;
    logoPreviewImg.classList.remove('hidden');
    logoPlaceholder.classList.add('hidden');
  }
  
  // Atualiza o título do modal
  document.getElementById('clubModalTitle').textContent = 'Editar Clube';
  
  // Exibe o modal
  modalOverlay.classList.remove('hidden');
  clubModal.classList.remove('hidden');
}

// Exclui um clube
async function deleteClub(clubId, escudoUrl) {
  try {
    // Exclui o documento no Firestore
    await deleteDoc(doc(db, 'clubes', clubId));
    
    // Se houver um escudo, exclui do Storage
    if (escudoUrl && escudoUrl.includes('firebase')) {
      const escudoRef = ref(storage, escudoUrl);
      await deleteObject(escudoRef);
    }
    
    // Recarrega a lista
    loadClubs();
    
    console.log('Clube excluído com sucesso');
  } catch (error) {
    console.error('Erro ao excluir clube:', error);
  }
}

// Reseta o formulário de clube
function resetClubForm() {
  document.getElementById('clubForm').reset();
  document.getElementById('clubId').value = '';
  document.getElementById('logoPreviewImg').classList.add('hidden');
  document.getElementById('logoPlaceholder').classList.remove('hidden');
  document.getElementById('clubError').classList.add('hidden');
}

// Busca todos os clubes para uso em outros módulos
export async function getAllClubs() {
  try {
    const clubesQuery = query(collection(db, 'clubes'), orderBy('nome'));
    const querySnapshot = await getDocs(clubesQuery);
    
    const clubes = [];
    querySnapshot.forEach((doc) => {
      clubes.push({ id: doc.id, ...doc.data() });
    });
    
    return clubes;
  } catch (error) {
    console.error('Erro ao buscar clubes:', error);
    return [];
  }
}

// Atualiza as estatísticas de um clube
export async function updateClubStats(clubId, stats) {
  try {
    await updateDoc(doc(db, 'clubes', clubId), {
      estatisticas: stats
    });
    
    console.log('Estatísticas do clube atualizadas com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do clube:', error);
  }
}