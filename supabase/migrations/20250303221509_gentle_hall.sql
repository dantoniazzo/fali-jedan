/*
  # Create initial schema for Croatia Sports Tracker

  1. New Tables
    - `matches` - Stores information about sports matches
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `sport` (text) - Type of sport (football, basketball, etc.)
      - `location` (text) - City where the match takes place
      - `venue` (text) - Specific venue name
      - `latitude` (float) - Venue latitude for map display
      - `longitude` (float) - Venue longitude for map display
      - `match_time` (timestamp) - When the match starts
      - `team_a` (text) - First team name
      - `team_b` (text) - Second team name
      - `description` (text, optional) - Additional match details
      - `user_id` (uuid) - References auth.users

    - `profiles` - Stores user profile information
      - `id` (uuid, primary key) - References auth.users
      - `updated_at` (timestamp)
      - `username` (text, optional)
      - `full_name` (text, optional)
      - `avatar_url` (text, optional)

    - `match_participants` - Tracks users who join matches
      - `id` (uuid, primary key)
      - `match_id` (uuid) - References matches.id
      - `user_id` (uuid) - References auth.users
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read all matches
      - Create matches
      - Update/delete only their own matches
      - Join matches
      - Read/update their own profile
*/

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  sport text NOT NULL,
  location text NOT NULL,
  venue text NOT NULL,
  latitude float NOT NULL,
  longitude float NOT NULL,
  match_time timestamptz NOT NULL,
  team_a text NOT NULL,
  team_b text NOT NULL,
  description text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamptz,
  username text UNIQUE,
  full_name text,
  avatar_url text
);

-- Create match participants table
CREATE TABLE IF NOT EXISTS match_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;

-- Matches policies
CREATE POLICY "Anyone can read matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create matches"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches"
  ON matches
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can read any profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Match participants policies
CREATE POLICY "Users can read match participants"
  ON match_participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join matches"
  ON match_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave matches they joined"
  ON match_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a trigger to create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, updated_at)
  VALUES (new.id, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();