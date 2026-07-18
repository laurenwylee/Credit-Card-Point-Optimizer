create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_cards (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, card_key)
);

create table if not exists public.reward_balances (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_key text not null,
  balance bigint not null check (balance >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, card_key),
  foreign key (user_id, card_key) references public.user_cards(user_id, card_key) on delete cascade
);

alter table public.profiles enable row level security;
alter table public.user_cards enable row level security;
alter table public.reward_balances enable row level security;

create policy "users manage own profile" on public.profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own cards" on public.user_cards for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own balances" on public.reward_balances for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.save_onboarding_profile(p_input jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  item jsonb;
  entry_key text;
  entry_value text;
begin
  if current_user_id is null then raise exception 'Unauthorized'; end if;

  delete from public.user_cards where user_id = current_user_id;
  delete from public.reward_balances where user_id = current_user_id;

  for item in select value from jsonb_array_elements(p_input->'cardKeys') loop
    insert into public.user_cards (user_id, card_key)
    values (current_user_id, item#>>'{}');
  end loop;

  for entry_key, entry_value in select * from jsonb_each_text(p_input->'cardPointBalances') loop
    insert into public.reward_balances (user_id, card_key, balance)
    values (current_user_id, entry_key, entry_value::bigint);
  end loop;

  insert into public.profiles (user_id, onboarding_completed_at, updated_at)
  values (current_user_id, now(), now())
  on conflict (user_id) do update set
    onboarding_completed_at = excluded.onboarding_completed_at,
    updated_at = excluded.updated_at;
end;
$$;

grant execute on function public.save_onboarding_profile(jsonb) to authenticated;
