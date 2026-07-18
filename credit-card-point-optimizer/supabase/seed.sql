-- Placeholder seed for point_valuations.
-- These cpp figures are rough, illustrative industry ballparks — NOT pulled
-- from a live source. Before relying on this table, replace `cents_per_point`,
-- `source_url`, and `valid_month` with the actual current-month numbers from
-- TPG (thepointsguy.com/guide/monthly-valuations) or NerdWallet.

insert into point_valuations
  (currency_code, program_name, category, cents_per_point, source, source_url, valid_month, notes)
values
  ('chase_ur', 'Chase Ultimate Rewards', 'bank_transferable', 2.000, 'The Points Guy', null, '2026-07-01', 'placeholder — verify monthly'),
  ('amex_mr', 'Amex Membership Rewards', 'bank_transferable', 2.000, 'The Points Guy', null, '2026-07-01', 'placeholder — verify monthly'),
  ('citi_typ', 'Citi ThankYou Points', 'bank_transferable', 1.800, 'The Points Guy', null, '2026-07-01', 'placeholder — verify monthly'),
  ('capital_one', 'Capital One Miles', 'bank_transferable', 1.850, 'The Points Guy', null, '2026-07-01', 'placeholder — verify monthly'),
  ('united_mileageplus', 'United MileagePlus', 'airline', 1.300, 'The Points Guy', null, '2026-07-01', 'placeholder — verify monthly'),
  ('delta_skymiles', 'Delta SkyMiles', 'airline', 1.200, 'The Points Guy', null, '2026-07-01', 'placeholder — verify monthly'),
  ('american_aadvantage', 'American AAdvantage', 'airline', 1.400, 'The Points Guy', null, '2026-07-01', 'placeholder — verify monthly'),
  ('southwest_rr', 'Southwest Rapid Rewards', 'airline', 1.400, 'The Points Guy', null, '2026-07-01', 'placeholder — verify monthly'),
  ('marriott_bonvoy', 'Marriott Bonvoy', 'hotel', 0.800, 'The Points Guy', null, '2026-07-01', 'placeholder — verify monthly'),
  ('hilton_honors', 'Hilton Honors', 'hotel', 0.500, 'The Points Guy', null, '2026-07-01', 'placeholder — verify monthly'),
  ('hyatt_world_of_hyatt', 'World of Hyatt', 'hotel', 1.700, 'The Points Guy', null, '2026-07-01', 'placeholder — verify monthly'),
  ('ihg_one_rewards', 'IHG One Rewards', 'hotel', 0.500, 'The Points Guy', null, '2026-07-01', 'placeholder — verify monthly'),
  ('generic_cashback', 'Flat Cashback', 'cashback', 1.000, 'N/A', null, '2026-07-01', 'baseline for comparison, always 1.0 by definition')
on conflict (currency_code) do nothing;

-- Placeholder transfer-partner ratios. Real ratios/bonuses should come from
-- rewardscc.com once that integration is built; hand-verify these before
-- relying on them.

insert into transfer_partners
  (from_currency_code, to_currency_code, ratio, bonus_pct, bonus_expires_at, source, source_url)
values
  ('chase_ur', 'united_mileageplus', 1.000, 0, null, 'manual', null),
  ('chase_ur', 'hyatt_world_of_hyatt', 1.000, 0, null, 'manual', null),
  ('chase_ur', 'southwest_rr', 1.000, 0, null, 'manual', null),
  ('amex_mr', 'delta_skymiles', 1.000, 0, null, 'manual', null),
  ('amex_mr', 'hilton_honors', 1.000, 0, null, 'manual', null),
  ('amex_mr', 'marriott_bonvoy', 1.000, 0, null, 'manual', null),
  ('citi_typ', 'american_aadvantage', 1.000, 0, null, 'manual', null),
  ('citi_typ', 'hilton_honors', 1.000, 0, null, 'manual', null),
  ('capital_one', 'american_aadvantage', 1.000, 0, null, 'manual', null),
  ('capital_one', 'united_mileageplus', 1.000, 0, null, 'manual', null),
  ('capital_one', 'hilton_honors', 2.000, 0, null, 'manual', null)
on conflict (from_currency_code, to_currency_code) do nothing;

-- Placeholder sweet spots. Real figures need hand research per program
-- (award charts, off-peak calendars) — these are illustrative examples of
-- the kind of fixed-price redemption that beats the average cpp.

insert into sweet_spots
  (currency_code, title, points_required, typical_cash_value_usd, unit, source, source_url, notes)
values
  ('hyatt_world_of_hyatt', 'Category 1 off-peak night', 3500, 120.00, 'night', 'manual', null, 'placeholder — verify against current Hyatt award chart'),
  ('hyatt_world_of_hyatt', 'Category 4 standard night', 12000, 300.00, 'night', 'manual', null, 'placeholder — verify against current Hyatt award chart'),
  ('marriott_bonvoy', 'Category 1 off-peak night', 5000, 100.00, 'night', 'manual', null, 'placeholder — verify against current Marriott award chart'),
  ('hilton_honors', 'Category 1 standard night', 5000, 90.00, 'night', 'manual', null, 'placeholder — verify against current Hilton award chart'),
  ('united_mileageplus', 'Saver economy round-trip (domestic)', 25000, 350.00, 'round-trip flight', 'manual', null, 'placeholder — saver availability is not guaranteed');
