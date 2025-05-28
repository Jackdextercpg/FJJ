/*
  # Schema inicial do banco de dados

  1. Novas Tabelas
    - teams (times)
    - players (jogadores)
    - championships (campeonatos)
    - matches (partidas)
    - match_scorers (gols)
    - transfers (transferências)
    - championship_history (histórico)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de leitura pública
    - Políticas de escrita apenas para admin
*/

-- Tabela de Times (precisa ser criada primeiro por causa das referências)
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  background_url text,
  fjjdoty_balance integer NOT NULL DEFAULT 50000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Jogadores
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  team_id uuid REFERENCES teams(id),
  goals integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Campeonatos
CREATE TABLE IF NOT EXISTS championships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  season text NOT NULL,
  status text NOT NULL CHECK (status IN ('setup', 'group', 'knockout', 'finished')),
  max_teams integer NOT NULL DEFAULT 6,
  schedule_type text NOT NULL CHECK (schedule_type IN ('random', 'manual')),
  winner_id uuid REFERENCES teams(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Partidas
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id uuid REFERENCES championships(id),
  home_team_id uuid REFERENCES teams(id),
  away_team_id uuid REFERENCES teams(id),
  home_score integer,
  away_score integer,
  date timestamptz NOT NULL,
  played boolean NOT NULL DEFAULT false,
  stage text NOT NULL CHECK (stage IN ('group', 'semifinal', 'final')),
  match_day integer NOT NULL,
  is_manual boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Gols
CREATE TABLE IF NOT EXISTS match_scorers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id),
  player_id uuid REFERENCES players(id),
  team_id uuid REFERENCES teams(id),
  goals integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Transferências
CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id),
  from_team_id uuid REFERENCES teams(id),
  to_team_id uuid REFERENCES teams(id) NOT NULL,
  amount integer NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Histórico de Campeões
CREATE TABLE IF NOT EXISTS championship_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season text NOT NULL,
  champion_id uuid REFERENCES teams(id),
  top_scorer_id uuid REFERENCES players(id),
  final_highlights text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scorers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_history ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Leitura pública de campeonatos" ON championships
  FOR SELECT USING (true);

CREATE POLICY "Leitura pública de times" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Leitura pública de jogadores" ON players
  FOR SELECT USING (true);

CREATE POLICY "Leitura pública de partidas" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Leitura pública de gols" ON match_scorers
  FOR SELECT USING (true);

CREATE POLICY "Leitura pública de transferências" ON transfers
  FOR SELECT USING (true);

CREATE POLICY "Leitura pública do histórico" ON championship_history
  FOR SELECT USING (true);

-- Políticas de Escrita (apenas admin)
CREATE POLICY "Escrita admin de campeonatos" ON championships
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Escrita admin de times" ON teams
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Escrita admin de jogadores" ON players
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Escrita admin de partidas" ON matches
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Escrita admin de gols" ON match_scorers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Escrita admin de transferências" ON transfers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Escrita admin do histórico" ON championship_history
  FOR ALL USING (auth.role() = 'authenticated');