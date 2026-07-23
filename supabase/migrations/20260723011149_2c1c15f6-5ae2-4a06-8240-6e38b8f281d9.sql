
-- Enum for roles
create type public.app_role as enum ('admin', 'applicant');

-- =====================================================================
-- profiles
-- =====================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  birthday date,
  portfolio_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

-- =====================================================================
-- applications
-- =====================================================================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  position text not null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  portfolio_url text,
  interview_date date,
  interview_time text,
  interview_location text,
  interview_location_url text,
  interview_notes text,
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.applications to authenticated;
grant all on public.applications to service_role;

alter table public.applications enable row level security;

-- =====================================================================
-- user_roles (kept separate from profiles to prevent privilege escalation)
-- =====================================================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

-- =====================================================================
-- Role check function (SECURITY DEFINER to avoid recursive RLS)
-- =====================================================================
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- =====================================================================
-- updated_at trigger
-- =====================================================================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.update_updated_at_column();

-- =====================================================================
-- New-user trigger: create profile + assign role
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, birthday, portfolio_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'birthday', '')::date,
    nullif(new.raw_user_meta_data->>'portfolio_url', '')
  );

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when lower(new.email) = 'admin@genz-s.com' then 'admin'::public.app_role
         else 'applicant'::public.app_role end
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- RLS policies: profiles
-- =====================================================================
create policy "Users can view own profile or admins view all"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));

create policy "Users can update own profile or admins update all"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.has_role(auth.uid(), 'admin'))
  with check (auth.uid() = id or public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- RLS policies: applications
-- =====================================================================
create policy "Users can view own application or admins view all"
  on public.applications for select
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Users can create own application"
  on public.applications for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own application or admins update all"
  on public.applications for update
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'))
  with check (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete applications"
  on public.applications for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- RLS policies: user_roles
-- =====================================================================
create policy "Users can view own role or admins view all"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Only admins can insert roles"
  on public.user_roles for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update roles"
  on public.user_roles for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete roles"
  on public.user_roles for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
