-- Initial schema for infiniStrikers
-- Creates tables for teams, players, matches, and match statistics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT, -- e.g., 'Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'
  jersey_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_number INTEGER NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  team_a_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  team_b_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  match_type TEXT DEFAULT 'league' CHECK (match_type IN ('league', 'playoff', 'semifinal', 'final')),
  venue TEXT,
  toss_winner_id UUID REFERENCES public.teams(id),
  toss_decision TEXT CHECK (toss_decision IN ('bat', 'bowl')),
  winner_id UUID REFERENCES public.teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match statistics (batting/bowling per team per innings)
CREATE TABLE IF NOT EXISTS public.match_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  innings INTEGER NOT NULL CHECK (innings IN (1, 2)),
  -- Batting stats
  runs INTEGER DEFAULT 0,
  balls_faced INTEGER DEFAULT 0,
  fours INTEGER DEFAULT 0,
  sixes INTEGER DEFAULT 0,
  extras INTEGER DEFAULT 0,
  wickets_lost INTEGER DEFAULT 0,
  -- Bowling stats (when this team is bowling)
  overs_bowled DECIMAL(4,1) DEFAULT 0,
  maidens INTEGER DEFAULT 0,
  runs_conceded INTEGER DEFAULT 0,
  wickets_taken INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, team_id, innings)
);

-- Player match performance
CREATE TABLE IF NOT EXISTS public.player_performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  -- Batting
  runs_scored INTEGER DEFAULT 0,
  balls_faced INTEGER DEFAULT 0,
  fours INTEGER DEFAULT 0,
  sixes INTEGER DEFAULT 0,
  is_out BOOLEAN DEFAULT FALSE,
  dismissal_type TEXT,
  -- Bowling
  overs_bowled DECIMAL(4,1) DEFAULT 0,
  maidens INTEGER DEFAULT 0,
  runs_conceded INTEGER DEFAULT 0,
  wickets INTEGER DEFAULT 0,
  -- Fielding
  catches INTEGER DEFAULT 0,
  stumpings INTEGER DEFAULT 0,
  run_outs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_team_id ON public.players(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(date);
CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON public.match_statistics(match_id);
CREATE INDEX IF NOT EXISTS idx_player_performances_match_id ON public.player_performances(match_id);
CREATE INDEX IF NOT EXISTS idx_player_performances_player_id ON public.player_performances(player_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_performances ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access on teams" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on players" ON public.players
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on matches" ON public.matches
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on match_statistics" ON public.match_statistics
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on player_performances" ON public.player_performances
  FOR SELECT USING (true);

-- Admin write access policies (authenticated users)
CREATE POLICY "Allow authenticated write on teams" ON public.teams
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write on players" ON public.players
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write on matches" ON public.matches
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write on match_statistics" ON public.match_statistics
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write on player_performances" ON public.player_performances
  FOR ALL USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_statistics_updated_at
  BEFORE UPDATE ON public.match_statistics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_performances_updated_at
  BEFORE UPDATE ON public.player_performances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
