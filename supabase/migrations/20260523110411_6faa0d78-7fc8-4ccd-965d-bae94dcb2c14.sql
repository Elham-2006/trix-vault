
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ref_code TEXT;
  ref_user UUID;
  is_first BOOLEAN;
BEGIN
  ref_code := upper(substr(md5(NEW.id::text || clock_timestamp()::text), 1, 8));

  IF NEW.raw_user_meta_data ? 'referred_by_code' THEN
    SELECT id INTO ref_user FROM public.profiles
    WHERE referral_code = upper(NEW.raw_user_meta_data->>'referred_by_code') LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, name, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    ref_code,
    ref_user
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  -- First-ever user becomes admin
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO is_first;
  IF is_first THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;

  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
