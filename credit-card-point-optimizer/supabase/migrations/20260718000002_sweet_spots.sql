-- Known fixed-price redemptions ("sweet spots") where a program's real value
-- for a specific redemption beats its average cents-per-point. Average cpp
-- (point_valuations) tells you what a currency is worth in general; this
-- table captures the exceptions worth calling out specifically, e.g. an
-- off-peak hotel night that costs far less than the cash rate would imply.

create table sweet_spots (
  id uuid primary key default gen_random_uuid(),
  currency_code text not null references point_valuations (currency_code),
  title text not null,                        -- e.g. 'Category 1 off-peak night'
  points_required integer not null,           -- points for one unit of this redemption
  typical_cash_value_usd numeric(8, 2) not null, -- what that unit would cost in cash
  unit text not null default 'redemption',    -- e.g. 'night', 'round-trip flight'
  source text not null,
  source_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index sweet_spots_currency_idx on sweet_spots (currency_code);
