-- 1. Restrict SECURITY DEFINER trigger function from being callable by API roles
REVOKE ALL ON FUNCTION public.grant_first_user_admin() FROM PUBLIC, anon, authenticated;

-- has_role must stay executable: it is referenced by RLS policies evaluated as the caller.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 2. Server-side validation constraints on public contact form inserts
ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_name_valid
    CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
  ADD CONSTRAINT contact_messages_email_valid
    CHECK (char_length(email) <= 255 AND email ~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT contact_messages_message_valid
    CHECK (char_length(btrim(message)) BETWEEN 10 AND 2000),
  ADD CONSTRAINT contact_messages_service_valid
    CHECK (service IS NULL OR char_length(service) <= 60);