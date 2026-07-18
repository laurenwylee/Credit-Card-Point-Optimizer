-- Step 1 of the points-valuation layer: a maintained reference table of
-- cents-per-point (cpp) estimates per loyalty currency, since no issuer
-- publishes a live valuation API. Sourced monthly from TPG/NerdWallet-style
-- valuations and updated by hand (see supabase/seed.sql).

create type point_currency_category as enum (
  'bank_transferable', -- Chase UR, Amex MR, Citi TYP, Capital One, etc.
  'airline',
  'hotel',
  'cashback'
);

create table point_valuations (
  id uuid primary key default gen_random_uuid(),
  currency_code text not null unique, -- e.g. 'chase_ur', 'amex_mr', 'united_mileageplus'
  program_name text not null,         -- e.g. 'Chase Ultimate Rewards'
  category point_currency_category not null,
  cents_per_point numeric(6, 3) not null,
  source text not null,               -- e.g. 'The Points Guy', 'NerdWallet'
  source_url text,
  valid_month date not null,          -- first-of-month the valuation applies to
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index point_valuations_category_idx on point_valuations (category);

create function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger point_valuations_set_updated_at
  before update on point_valuations
  for each row
  execute function set_updated_at();
