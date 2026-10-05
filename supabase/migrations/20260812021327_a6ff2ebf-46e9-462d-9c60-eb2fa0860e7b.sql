ALTER TABLE public.media_items DROP CONSTRAINT IF EXISTS media_items_category_check;
ALTER TABLE public.media_items ADD CONSTRAINT media_items_category_check
  CHECK (category = ANY (ARRAY['web','video','photo','song','travel','book','game']));

CREATE TABLE public.project_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category = ANY (ARRAY['web','video'])),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (email ~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND char_length(email) <= 255),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 40),
  budget text CHECK (budget IS NULL OR char_length(budget) <= 60),
  message text NOT NULL CHECK (char_length(btrim(message)) BETWEEN 10 AND 3000),
  attachments text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'new' CHECK (status = ANY (ARRAY['new','in_progress','done','archived'])),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.project_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.project_requests TO authenticated;
GRANT ALL ON public.project_requests TO service_role;

ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a project request"
  ON public.project_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read project requests"
  ON public.project_requests FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update project requests"
  ON public.project_requests FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete project requests"
  ON public.project_requests FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER update_project_requests_updated_at
  BEFORE UPDATE ON public.project_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Visitors can attach request files"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'requests');