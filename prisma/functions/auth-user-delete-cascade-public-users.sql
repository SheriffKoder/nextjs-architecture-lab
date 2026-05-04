-- Cascade delete from public.users when a user is deleted from auth.users.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor) so the trigger
-- is created on the auth schema.
--
-- When you call auth.admin.deleteUser(id), this trigger runs and removes the
-- matching row in public.users.

CREATE OR REPLACE FUNCTION public.handle_auth_user_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- Drop the trigger if it already exists (idempotent), then create it.
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_deleted();
  -- On PostgreSQL < 14 use: EXECUTE PROCEDURE public.handle_auth_user_deleted();
