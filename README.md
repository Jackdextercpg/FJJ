The code was updated to include deployment instructions and multi-device synchronization information.
```
```replit_final_file
# FJJ Brasileirão

Sistema de gerenciamento de campeonato de futebol desenvolvido em React com TypeScript.

## 🌐 Sincronização Multi-Dispositivo

Este aplicativo suporta sincronização em tempo real entre múltiplos dispositivos:

### ✅ **Modo Local (Sem Configuração)**
- Funciona offline usando localStorage
- Dados são salvos localmente em cada dispositivo
- Ideal para uso individual

### ✅ **Modo Sincronizado (Recomendado)**
- Sincronização automática entre dispositivos
- Múltiplos usuários podem ver e gerenciar o mesmo campeonato
- Atualizações em tempo real

## 🚀 Deploy no Replit

### Passos para Deploy:

1. **Clique no botão "Deploy"** no topo da tela
2. **Escolha "Autoscale"** para melhor performance
3. **Configure:**
   - Build Command: `npm run build`
   - Run Command: `npm run preview -- --host 0.0.0.0 --port 5000`
4. **Deploy!**

### Para Sincronização Multi-Dispositivo:

1. **Configure o Supabase** (opcional):
   - Crie uma conta no [Supabase](https://supabase.com)
   - Crie um novo projeto
   - Vá em Settings > API
   - Copie a URL e Anon Key

2. **Configure as variáveis de ambiente**:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

3. **Faça deploy** - A sincronização será automática!

## 📱 Características Multi-Dispositivo

- **Sincronização Automática**: Dados são sincronizados a cada 10 segundos
- **Modo Offline**: Funciona sem internet, sincroniza quando reconecta
- **Status de Conexão**: Indicador visual do status de sincronização
- **Responsivo**: Interface adaptada para mobile, tablet e desktop

## 🎯 Funcionalidades

### Gerenciamento de Times
- Criar e editar times com logo e cores
- Sistema de saldo FJJdoty
- Gestão de elenco

### Sistema de Campeonatos
- Fase de grupos e eliminatórias
- Classificação automática
- Histórico de campeões

### Transferências
- Mercado de transferências entre times
- Sistema monetário integrado
- Histórico de movimentações

### Estatísticas
- Artilharia
- Classificação
- Histórico de partidas

# FJJ BRASILEIRÃO SÉRIE A

Sistema de gerenciamento de campeonato de futebol fictício desenvolvido com React, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

### ⚽ Gerenciamento de Times
- Cadastro de times com nome e imagem personalizada
- Gerenciamento de jogadores por time
- Sistema de transferências com moeda virtual (FJJDOTY)

### 📊 Campeonato
- Fase de grupos com 6 times
- Semifinais com 4 classificados
- Final em jogo único
- Sistema de rebaixamento
- Tabela de classificação automática
- Artilharia atualizada em tempo real

### 💰 Sistema Econômico (FJJDOTY)
- Vitória: +10.000 FJJDOTY
- Empate: +3.000 FJJDOTY
- Derrota: +1.000 FJJDOTY
- Transferência entre times: 100.000 FJJDOTY
- Contratação externa: 200.000 FJJDOTY

## 🛠️ Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 📱 Interface

- Design responsivo (mobile e desktop)
- Interface limpa e intuitiva
- Painel administrativo completo

## 👨‍💻 Tecnologias

- React
- TypeScript
- Tailwind CSS
- Lucide Icons
- Vite

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.