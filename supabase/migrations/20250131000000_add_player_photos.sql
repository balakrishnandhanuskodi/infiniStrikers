-- Add player_photos column to teams table
ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS player_photos TEXT[] DEFAULT '{}';

-- Create storage bucket for player photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('player-photos', 'player-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to player photos
CREATE POLICY "Public read access for player photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'player-photos');

-- Allow authenticated users to upload player photos
CREATE POLICY "Authenticated users can upload player photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'player-photos' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to update player photos
CREATE POLICY "Authenticated users can update player photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'player-photos' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete player photos
CREATE POLICY "Authenticated users can delete player photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'player-photos' AND auth.uid() IS NOT NULL);
