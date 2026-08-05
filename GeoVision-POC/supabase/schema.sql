create table public.analysis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  results jsonb not null,
  created_at timestamptz not null default now()
);

create index analysis_history_user_created_idx
  on public.analysis_history (user_id, created_at desc);

alter table public.analysis_history enable row level security;

create policy "Users can read their history"
  on public.analysis_history for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add to their history"
  on public.analysis_history for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their history"
  on public.analysis_history for delete
  to authenticated
  using ((select auth.uid()) = user_id);
