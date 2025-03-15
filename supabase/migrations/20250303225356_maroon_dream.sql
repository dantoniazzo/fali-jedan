/*
  # Add foreign key relationship between match_participants and profiles

  1. Changes
     - Add a foreign key constraint to ensure match_participants.user_id references profiles.id
     - This enables proper joins between the tables
     - Add policies for profiles and match_participants tables
*/

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'match_participants_user_id_fkey_profiles' 
    AND table_name = 'match_participants'
  ) THEN
    ALTER TABLE match_participants
    ADD CONSTRAINT match_participants_user_id_fkey_profiles
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Ensure profiles can be read by authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Profiles are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Profiles are viewable by authenticated users"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;

-- Ensure match_participants can be read by authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'match_participants' 
    AND policyname = 'Match participants are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Match participants are viewable by authenticated users"
      ON match_participants
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;