-- Виконайте в Supabase SQL Editor після додавання SUPABASE_SERVICE_ROLE_KEY
-- у Vercel. Публічний ключ зможе лише створювати нові заявки, а читання,
-- зміна статусу та видалення працюватимуть тільки через захищені server API.

alter table public.callback_requests enable row level security;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'callback_requests'
  loop
    execute format('drop policy if exists %I on public.callback_requests', policy_record.policyname);
  end loop;
end;
$$;

create policy "callback_requests_public_insert"
on public.callback_requests for insert
to anon, authenticated
with check (status = 'new');

revoke select, update, delete on public.callback_requests from anon, authenticated;
grant insert on public.callback_requests to anon, authenticated;
grant all on public.callback_requests to service_role;
