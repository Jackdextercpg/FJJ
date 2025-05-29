
-- Create storage buckets for teams and players images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('teams', 'teams', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('players', 'players', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Create policies for public access to view images
CREATE POLICY "Public Access for teams images" ON storage.objects
  FOR SELECT USING (bucket_id = 'teams');

CREATE POLICY "Public Access for players images" ON storage.objects
  FOR SELECT USING (bucket_id = 'players');

-- Create policies for authenticated users to upload images
CREATE POLICY "Authenticated users can upload teams images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'teams');

CREATE POLICY "Authenticated users can upload players images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'players');

-- Create policies for authenticated users to update images
CREATE POLICY "Authenticated users can update teams images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'teams');

CREATE POLICY "Authenticated users can update players images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'players');

-- Create policies for authenticated users to delete images
CREATE POLICY "Authenticated users can delete teams images" ON storage.objects
  FOR DELETE USING (bucket_id = 'teams');

CREATE POLICY "Authenticated users can delete players images" ON storage.objects
  FOR DELETE USING (bucket_id = 'players');
