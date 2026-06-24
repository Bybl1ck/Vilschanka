-- Виконайте цей файл у Supabase SQL Editor перед `npm run seed:houses`.
create table if not exists public.houses (
  id text primary key,
  slug text unique not null,
  name text not null,
  short_description text not null default '',
  full_description text not null default '',
  price_per_night integer not null default 0 check (price_per_night >= 0),
  guests integer not null default 1 check (guests > 0),
  area integer not null default 1 check (area > 0),
  main_image text not null default '/images/house-water-exterior.svg',
  gallery text[] not null default '{}',
  amenities text[] not null default '{}',
  booked_dates text[] not null default '{}',
  prices jsonb not null default '{"monWed":0,"thu":0,"friSun":0,"sat":0}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists houses_active_created_idx
  on public.houses (is_active, created_at);

create or replace function public.set_houses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists houses_set_updated_at on public.houses;
create trigger houses_set_updated_at
before update on public.houses
for each row execute function public.set_houses_updated_at();

alter table public.houses enable row level security;

drop policy if exists "houses_public_read" on public.houses;
create policy "houses_public_read"
on public.houses for select
to anon, authenticated
using (is_active = true);

drop policy if exists "houses_api_insert" on public.houses;
drop policy if exists "houses_api_update" on public.houses;
drop policy if exists "houses_api_delete" on public.houses;

revoke insert, update, delete on public.houses from anon, authenticated;
grant select on public.houses to anon, authenticated;
grant all on public.houses to service_role;
