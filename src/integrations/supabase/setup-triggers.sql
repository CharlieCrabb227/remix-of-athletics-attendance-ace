
-- This is a reference file for the database triggers that should exist
-- To run this, execute it in the Supabase SQL editor

-- Create trigger to add user profiles when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, is_admin, is_player)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', ''),
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false),
    COALESCE((new.raw_user_meta_data->>'is_player')::boolean, true)
  );
  RETURN new;
END;
$$;

-- Check if the trigger exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;
