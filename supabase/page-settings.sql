create extension if not exists pgcrypto;

create table if not exists public.page_settings (
  id uuid primary key default gen_random_uuid(),
  page_key text unique not null check (page_key in ('home', 'houses', 'restaurant', 'activities', 'discounts', 'contacts')),
  title text,
  subtitle text,
  background_image text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_page_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists page_settings_set_updated_at on public.page_settings;
create trigger page_settings_set_updated_at
before update on public.page_settings
for each row execute function public.set_page_settings_updated_at();

insert into public.page_settings (page_key, title, subtitle, background_image)
values
  ('home', 'Заміський комплекс відпочинку «Вільшанка»', 'Будиночки, баня, риболовля, SUP, каяки та ресторан серед природи.', '/images/hero-lake.svg'),
  ('houses', 'Будиночки для вашого відпочинку', 'Від камерного будиночка для двох до просторого дому для великої компанії.', '/images/hero-lake.svg'),
  ('restaurant', 'Ресторан «Вільшанка»', 'Тепла кухня, сезонні продукти й атмосфера для довгих розмов.', '/images/house-big-interior.svg'),
  ('activities', 'На воді, біля вогню, серед тиші', 'Активний і спокійний відпочинок у своєму ритмі.', '/images/hero-lake.svg'),
  ('discounts', 'Знижки та спеціальні пропозиції', 'Приємні умови для особливих випадків.', '/images/hero-lake.svg'),
  ('contacts', 'Заплануймо ваш відпочинок', 'Телефони, адреса та спосіб прокласти маршрут.', '/images/hero-lake.svg')
on conflict (page_key) do nothing;

alter table public.page_settings enable row level security;

drop policy if exists "page_settings_public_read" on public.page_settings;
create policy "page_settings_public_read"
on public.page_settings for select
to anon, authenticated
using (true);

revoke insert, update, delete on public.page_settings from anon, authenticated;
grant select on public.page_settings to anon, authenticated;
grant all on public.page_settings to service_role;
