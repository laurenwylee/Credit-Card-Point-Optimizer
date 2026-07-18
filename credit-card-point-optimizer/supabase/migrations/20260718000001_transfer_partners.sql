-- Transfer-partner mappings for bank-transferable currencies (Chase UR,
-- Amex MR, Citi TYP, Capital One, etc.) to the airline/hotel programs they
-- transfer into. Normally this would sync from a live source (e.g.
-- rewardscc.com's transfer-partner endpoint) but that integration is
-- deferred, so this is hand-maintained for now, same as point_valuations.

create table transfer_partners (
  id uuid primary key default gen_random_uuid(),
  from_currency_code text not null references point_valuations (currency_code),
  to_currency_code text not null references point_valuations (currency_code),
  ratio numeric(6, 3) not null default 1.000, -- destination points per 1 source point
  bonus_pct numeric(5, 2) not null default 0, -- current transfer bonus, e.g. 30 for a 30% bonus
  bonus_expires_at date,
  source text not null,
  source_url text,
  updated_at timestamptz not null default now(),
  unique (from_currency_code, to_currency_code)
);

create index transfer_partners_from_idx on transfer_partners (from_currency_code);

create trigger transfer_partners_set_updated_at
  before update on transfer_partners
  for each row
  execute function set_updated_at();
