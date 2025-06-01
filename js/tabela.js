// tabela.js - Gerenciamento da tabela de classificação

import { db } from './firebase.js';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getAllClubs } from './clubes.js';
import { showLoadingIndicator, hideLoadingIndicator } from './utils.js';

// Inicialização do módulo de tabela
export function initTable() {
  loadTable();
}

// Carrega a tabela de classificação
export async function loadTable() {
  const tabelaBody = document.getElementById('tabelaBody');
  const tabelaLoading = document.getElementById('tabelaLoading');
  const tabelaEmpty = document.getElementById('tabelaEmpty');
  
  try {
    // Mostra loading
    showLoadingIndicator(tabelaLoading, tabelaBody.parentElement, tabelaEmpty);
    
    // Busca os clubes
    const clubes = await getAllClubs();
    
    // Verifica se há dados
    if (clubes.length === 0) {
      hideLoadingIndicator(tabelaLoading, tabelaEmpty);
      return;
    }
    
    // Calcula pontos e saldo de gols
    const clubesCalculados = clubes.map(clube => {
      const estatisticas = clube.estatisticas || { vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0 };
      
      return {
        ...clube,
        pontos: (estatisticas.vitorias * 3) + estatisticas.empates,
        jogos: estatisticas.vitorias + estatisticas.empates + estatisticas.derrotas,
        saldoGols: estatisticas.golsPro - estatisticas.golsContra
      };
    });
    
    // Ordena a tabela por pontos, vitórias e saldo de gols
    clubesCalculados.sort((a, b) => {
      if (a.pontos !== b.pontos) {
        return b.pontos - a.pontos; // Mais pontos primeiro
      }
      if (a.estatisticas.vitorias !== b.estatisticas.vitorias) {
        return b.estatisticas.vitorias - a.estatisticas.vitorias; // Mais vitórias depois
      }
      if (a.saldoGols !== b.saldoGols) {
        return b.saldoGols - a.saldoGols; // Melhor saldo depois
      }
      return b.estatisticas.golsPro - a.estatisticas.golsPro; // Mais gols pró por último
    });
    
    // Limpa a tabela
    tabelaBody.innerHTML = '';
    
    // Preenche a tabela
    clubesCalculados.forEach((clube, index) => {
      const row = createTableRow(clube, index + 1);
      tabelaBody.appendChild(row);
    });
    
    // Esconde loading e mostra resultados
    hideLoadingIndicator(tabelaLoading);
    tabelaBody.parentElement.classList.remove('hidden');
  } catch (error) {
    console.error('Erro ao carregar tabela:', error);
    hideLoadingIndicator(tabelaLoading, tabelaEmpty);
  }
}

// Cria uma linha da tabela de classificação
function createTableRow(clube, posicao) {
  const row = document.createElement('tr');
  const estat = clube.estatisticas || { vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0 };
  
  row.innerHTML = `
    <td class="pos">${posicao}</td>
    <td class="clube">
      <div class="clube-info">
        <img src="${clube.escudo || 'https://via.placeholder.com/24'}" alt="${clube.nome}" class="clube-escudo">
        <span class="clube-nome">${clube.nome}</span>
      </div>
    </td>
    <td>${clube.pontos}</td>
    <td>${clube.jogos}</td>
    <td>${estat.vitorias}</td>
    <td>${estat.empates}</td>
    <td>${estat.derrotas}</td>
    <td>${estat.golsPro}</td>
    <td>${estat.golsContra}</td>
    <td>${clube.saldoGols}</td>
  `;
  
  return row;
}

// Atualiza a tabela de classificação (chamada após salvar partidas)
export async function updateTable() {
  await loadTable();
}

// Exporta funções necessárias
export default { initTable, updateTable };