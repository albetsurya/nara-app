-- Gratitude Jar: flag entries worth revisiting. Idempotent.

alter table public.journals
  add column if not exists is_gratitude boolean not null default false;

create index if not exists journals_user_gratitude_idx
  on public.journals (user_id, created_at desc)
  where is_gratitude;
