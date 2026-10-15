-- Nara schema. Run in the Supabase SQL editor (or as a migration).

create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  username       text,
  companion_name text not null default 'Pip',
  intent         text,                       -- onboarding answer, e.g. 'clearer-head'
  created_at     timestamptz not null default now()
);

create table public.journals (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade default auth.uid(),
  content          text not null check (char_length(content) between 1 and 20000),
  mood             text not null default 'calm'
                   check (mood in ('happy','love','calm','surprised','sleepy')),
  duration_seconds integer not null default 0 check (duration_seconds >= 0), -- writing time, powers the daily ring
  created_at       timestamptz not null default now()
);
create index journals_user_created_idx on public.journals (user_id, created_at desc);

create table public.stamps (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  stamp_type text not null,
  earned_at  timestamptz not null default now(),
  unique (user_id, stamp_type)
);

-- ── Row Level Security: people only ever see their own rows ─────────────────
alter table public.profiles enable row level security;
alter table public.journals enable row level security;
alter table public.stamps   enable row level security;

create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "journals: own rows" on public.journals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Stamps are read-only for clients; the trigger below awards them.
create policy "stamps: read own" on public.stamps
  for select using (auth.uid() = user_id);

-- ── Auto-create a profile on sign-up ───────────────────────────────────────
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ── Award stamps when a journal entry is saved ─────────────────────────────
create function public.award_stamps() returns trigger
language plpgsql security definer set search_path = public as $$
declare days_3 int; days_7 int; total int;
begin
  select count(*) into total from journals where user_id = new.user_id;
  if total = 1  then insert into stamps (user_id, stamp_type) values (new.user_id, 'first_entry') on conflict do nothing; end if;
  if total = 10 then insert into stamps (user_id, stamp_type) values (new.user_id, 'ten_entries') on conflict do nothing; end if;

  -- "Consistency": distinct journaling days within the last 3 / 7 days (UTC)
  select count(distinct created_at::date) into days_3 from journals
    where user_id = new.user_id and created_at::date > current_date - 3;
  select count(distinct created_at::date) into days_7 from journals
    where user_id = new.user_id and created_at::date > current_date - 7;
  if days_3 = 3 then insert into stamps (user_id, stamp_type) values (new.user_id, 'three_day') on conflict do nothing; end if;
  if days_7 = 7 then insert into stamps (user_id, stamp_type) values (new.user_id, 'seven_day') on conflict do nothing; end if;
  return new;
end $$;

create trigger on_journal_inserted
  after insert on public.journals for each row execute function public.award_stamps();
