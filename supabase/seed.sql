-- Seed data for infiniStrikers local development

-- Insert sample teams with players array
INSERT INTO public.teams (id, name, players, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Team A', ARRAY['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'], NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Team B', ARRAY['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'], NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Team C', ARRAY['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'], NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample matches
INSERT INTO public.matches (id, match_number, date, team_a, team_b, status, match_type, created_at)
VALUES
  -- 9th February
  (gen_random_uuid(), 1, '9th February', 'Team A', 'Team C', 'scheduled', 'group', NOW()),
  (gen_random_uuid(), 2, '9th February', 'Team B', 'Team C', 'scheduled', 'group', NOW()),
  (gen_random_uuid(), 3, '9th February', 'Team A', 'Team B', 'scheduled', 'group', NOW()),
  -- 10th February
  (gen_random_uuid(), 1, '10th February', 'Team A', 'Team B', 'scheduled', 'group', NOW()),
  (gen_random_uuid(), 2, '10th February', 'Team A', 'Team C', 'scheduled', 'group', NOW()),
  (gen_random_uuid(), 3, '10th February', 'Team B', 'Team C', 'scheduled', 'group', NOW()),
  -- 11th February
  (gen_random_uuid(), 1, '11th February', 'Place 2', 'Place 3', 'scheduled', 'semi-final', NOW()),
  (gen_random_uuid(), 2, '11th February', 'Place 1', 'Winner of SF', 'scheduled', 'final', NOW())
ON CONFLICT DO NOTHING;
