-- Seed data for infiniStrikers local development

-- Insert sample teams
INSERT INTO public.teams (id, name, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Super Kings', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Royal Challengers', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Mumbai Indians', NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Delhi Capitals', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample players for Super Kings
INSERT INTO public.players (id, team_id, name, role, created_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'MS Dhoni', 'Wicketkeeper', NOW()),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Ravindra Jadeja', 'All-rounder', NOW()),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Ruturaj Gaikwad', 'Batsman', NOW())
ON CONFLICT DO NOTHING;

-- Insert sample players for Royal Challengers
INSERT INTO public.players (id, team_id, name, role, created_at)
VALUES
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Virat Kohli', 'Batsman', NOW()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Glenn Maxwell', 'All-rounder', NOW()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Mohammed Siraj', 'Bowler', NOW())
ON CONFLICT DO NOTHING;

-- Insert sample match
INSERT INTO public.matches (id, match_number, date, team_a_id, team_b_id, status, match_type, created_at)
VALUES
  (gen_random_uuid(), 1, NOW() + INTERVAL '7 days', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'upcoming', 'league', NOW())
ON CONFLICT DO NOTHING;
