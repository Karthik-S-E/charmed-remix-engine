create type public.app_role as enum ('admin', 'customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create policy "Users can read own or admin all profiles"
on public.profiles for select to authenticated
using (id = auth.uid() or public.has_role(auth.uid(), 'admin'::public.app_role));

create policy "Users can update own profile"
on public.profiles for update to authenticated
using (id = auth.uid());

create policy "Users can insert own profile"
on public.profiles for insert to authenticated
with check (id = auth.uid());

create policy "Users can read own or admin all roles"
on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'::public.app_role));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');
  return new;
end;
$$;

create trigger on_auth_user_created_role
after insert on auth.users
for each row execute function public.handle_new_user_role();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  design_number text,
  colors text[],
  color_images jsonb default '{}',
  style text,
  occasion text,
  price numeric not null,
  gender text not null check (gender in ('boy', 'girl', 'unisex')),
  age_range text not null,
  sizes text[] not null default '{}',
  in_stock boolean not null default true,
  stock_quantity integer not null default 0,
  description text,
  main_image text,
  meesho_url text,
  flipkart_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;

alter table public.products enable row level security;

create policy "Products are publicly readable"
on public.products for select to anon, authenticated
using (true);

create policy "Admins can manage products"
on public.products for all to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));

create table public.brand_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'Kandamma Kids',
  tagline text,
  logo_url text,
  updated_at timestamptz not null default now()
);

grant select on public.brand_settings to anon, authenticated;
grant select, insert, update, delete on public.brand_settings to authenticated;
grant all on public.brand_settings to service_role;

alter table public.brand_settings enable row level security;

create policy "Brand settings publicly readable"
on public.brand_settings for select to anon, authenticated
using (true);

create policy "Admins can manage brand settings"
on public.brand_settings for all to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));
