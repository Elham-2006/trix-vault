
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  referral_code TEXT NOT NULL UNIQUE,
  referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(18,2) NOT NULL DEFAULT 0,
  blocked BOOLEAN NOT NULL DEFAULT false,
  active_plan_id TEXT,
  plan_started_at TIMESTAMPTZ,
  last_profit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users update own profile name" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- VIP plans
CREATE TABLE public.vip_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  min_amount NUMERIC(18,2) NOT NULL,
  daily_percent NUMERIC(6,2) NOT NULL,
  duration_days INT NOT NULL,
  badge TEXT,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.vip_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read plans" ON public.vip_plans FOR SELECT USING (true);

INSERT INTO public.vip_plans (id, name, min_amount, daily_percent, duration_days, badge, sort_order) VALUES
  ('bronze','Bronze',50,1.2,30,NULL,1),
  ('silver','Silver',250,1.6,45,'Popular',2),
  ('gold','Gold',1000,2.1,60,'Best value',3),
  ('platinum','Platinum',5000,2.8,90,NULL,4),
  ('diamond','Diamond',20000,3.5,120,NULL,5);

-- Transactions
CREATE TYPE public.tx_type AS ENUM ('deposit','withdraw','profit','referral','vip');
CREATE TYPE public.tx_status AS ENUM ('pending','approved','rejected','completed');

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type tx_type NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  fee NUMERIC(18,2) NOT NULL DEFAULT 0,
  status tx_status NOT NULL DEFAULT 'pending',
  txid TEXT,
  from_addr TEXT,
  to_addr TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tx_user ON public.transactions(user_id, created_at DESC);
CREATE INDEX idx_tx_status ON public.transactions(status);
CREATE UNIQUE INDEX idx_tx_unique_txid ON public.transactions(txid) WHERE txid IS NOT NULL;

CREATE POLICY "users read own tx" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins read all tx" ON public.transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notif_user ON public.notifications(user_id, created_at DESC);

CREATE POLICY "users read own notif" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users update own notif" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ref_code TEXT;
  ref_user UUID;
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
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
