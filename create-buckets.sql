-- Create all required storage buckets for the demo app
-- Run this in your Supabase SQL Editor

-- Create avatars bucket (for profile pictures)
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create user-files bucket (general file storage)
INSERT INTO storage.buckets (id, name, public) VALUES 
('user-files', 'user-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create documents bucket (PDF, Word, Excel files)
INSERT INTO storage.buckets (id, name, public) VALUES 
('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create media bucket (images, videos, audio)
INSERT INTO storage.buckets (id, name, public) VALUES 
('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Create archives bucket (ZIP files)
INSERT INTO storage.buckets (id, name, public) VALUES 
('archives', 'archives', true)
ON CONFLICT (id) DO NOTHING;

-- Create gallery bucket (image gallery)
INSERT INTO storage.buckets (id, name, public) VALUES 
('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Verify buckets were created
SELECT id, name, public FROM storage.buckets ORDER BY id;
