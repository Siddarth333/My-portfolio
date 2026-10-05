CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- media_items
DROP POLICY "Admins can read all media" ON public.media_items;
DROP POLICY "Admins can insert media" ON public.media_items;
DROP POLICY "Admins can update media" ON public.media_items;
DROP POLICY "Admins can delete media" ON public.media_items;

CREATE POLICY "Admins can read all media" ON public.media_items
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert media" ON public.media_items
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update media" ON public.media_items
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete media" ON public.media_items
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- contact_messages
DROP POLICY "Admins can read messages" ON public.contact_messages;
DROP POLICY "Admins can delete messages" ON public.contact_messages;

CREATE POLICY "Admins can read messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete messages" ON public.contact_messages
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- storage.objects
DROP POLICY "Admins can upload media files" ON storage.objects;
DROP POLICY "Admins can read media files" ON storage.objects;
DROP POLICY "Admins can update media files" ON storage.objects;
DROP POLICY "Admins can delete media files" ON storage.objects;

CREATE POLICY "Admins can upload media files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can read media files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update media files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete media files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP FUNCTION public.has_role(uuid, public.app_role);