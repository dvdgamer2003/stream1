-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Videos are viewable by owner or if public" ON public.videos;
DROP POLICY IF EXISTS "Videos are insertable by authenticated users" ON public.videos;
DROP POLICY IF EXISTS "Videos are updatable by owner" ON public.videos;
DROP POLICY IF EXISTS "Videos are deletable by owner" ON public.videos;

-- Drop existing triggers and functions first
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_videos_updated_at ON public.videos;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_auth_user_created() CASCADE;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_videos_user_id;
DROP INDEX IF EXISTS idx_videos_public;
DROP INDEX IF EXISTS idx_videos_created_at;

-- Drop existing tables in correct order (dependent tables first)
DROP TABLE IF EXISTS public.videos;
DROP TABLE IF EXISTS public.users;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Add policy for auth service to insert users
CREATE POLICY "Auth service can insert users" ON public.users
    FOR INSERT
    WITH CHECK (true);  -- Allows the auth service to create users

-- Videos policies
CREATE POLICY "Videos are viewable by owner or if public" ON public.videos
    FOR SELECT
    USING (auth.uid() = user_id OR public = true);

CREATE POLICY "Videos are insertable by authenticated users" ON public.videos
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Videos are updatable by owner" ON public.videos
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Videos are deletable by owner" ON public.videos
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_public ON public.videos(public);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON public.videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to sync with auth.users
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for syncing with auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_created();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
