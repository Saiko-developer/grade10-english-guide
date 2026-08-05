CREATE POLICY "Students read own exam papers" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'exam-papers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students upload own exam papers" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'exam-papers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students update own exam papers" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'exam-papers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students delete own exam papers" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'exam-papers' AND auth.uid()::text = (storage.foldername(name))[1]);