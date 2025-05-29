// Common types
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Team related types
export interface Team extends BaseModel {
  name: string;
  logoUrl: string;
  backgroundUrl: string;
  fjjdotyBalance: number;
  players: string[]; // Player IDs
}

export interface Player extends BaseModel {
  name: string;
  imageUrl: string;
  teamId: string | null;
  goals: number;
}

// Match related types
export interface Match extends BaseModel {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  stage: 'group' | 'semifinal' | 'final';
  scorers: GoalScorer[];
  individualGoals: IndividualGoal[];
  matchDay: number;
  isManual?: boolean; // New field to track if match was manually created
}

export interface GoalScorer {
  playerId: string;
  teamId: string;
  count: number;
}

export interface IndividualGoal {
  playerId: string;
  teamId: string;
  goals: number;
}

// Championship related types
export interface Championship extends BaseModel {
  name: string;
  season: string;
  status: 'setup' | 'group' | 'knockout' | 'finished';
  teams: string[]; // Team IDs
  matches: string[]; // Match IDs
  winner: string | null; // Team ID
  maxTeams: number; // New field for maximum number of teams
  scheduleType: 'random' | 'manual'; // New field for scheduling type
}

// Transfer related types
export interface Transfer extends BaseModel {
  playerId: string;
  fromTeamId: string | null;
  toTeamId: string;
  amount: number;
  date: string;
}

// Standings and Stats
export interface TeamStanding {
  teamId: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

// Past champions
export interface ChampionshipHistory extends BaseModel {
  season: string;
  championId: string;
  topScorerId: string;
  finalHighlights: string;
}