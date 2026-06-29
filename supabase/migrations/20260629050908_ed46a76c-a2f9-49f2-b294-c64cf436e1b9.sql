
CREATE POLICY "stretch_media read" ON storage.objects FOR SELECT
  USING (bucket_id = 'stretch-media');
CREATE POLICY "stretch_media insert own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'stretch-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "stretch_media update own" ON storage.objects FOR UPDATE
  USING (bucket_id = 'stretch-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "stretch_media delete own" ON storage.objects FOR DELETE
  USING (bucket_id = 'stretch-media' AND auth.uid()::text = (storage.foldername(name))[1]);
