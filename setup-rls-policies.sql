-- Supabase Storage RLS Policies Setup
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security for storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT operations
CREATE POLICY objects_select_policy ON storage.objects FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy for INSERT operations
CREATE POLICY objects_insert_policy ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy for UPDATE operations
CREATE POLICY objects_update_policy ON storage.objects FOR UPDATE
USING (auth.role() = 'authenticated');

-- Policy for DELETE operations
CREATE POLICY objects_delete_policy ON storage.objects FOR DELETE
USING (auth.role() = 'authenticated');
