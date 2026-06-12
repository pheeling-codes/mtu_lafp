-- Create profiles table to store user profile information
-- This table extends Supabase auth.users

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  matric_number TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'STAFF', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role to perform all operations
CREATE POLICY "Service role can manage all profiles"
  ON profiles
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_matric_number ON profiles(matric_number);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
