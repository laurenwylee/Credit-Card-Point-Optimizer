// Fetches card details from the Rewards Credit Card API (via RapidAPI) for a
// hardcoded shortlist of popular cards and caches the responses to
// data/cards.json, so the demo never depends on live API calls.
//
// Usage:
//   1. Put your key in .env.local:  RAPIDAPI_KEY=xxxx
//   2. node scripts/fetch-cards.mjs
//
// Re-running overwrites data/cards.json with fresh data.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const HOST = process.env.RAPIDAPI_HOST ?? "rewards-credit-card-api.p.rapidapi.com";
const BASE = `https://${HOST}`;

// Search terms for the demo card set. The namesearch endpoint resolves each of
// these to a cardKey, then we fetch full detail per card.
const CARD_SEARCHES = [
  "Amex Gold",
  "Amex Platinum",
  "Blue Cash Preferred",
  "Chase Sapphire Preferred",
  "Chase Sapphire Reserve",
  "Chase Freedom Unlimited",
  "Chase Freedom Flex",
  "Citi Double Cash",
  "Citi Custom Cash",
  "Capital One Venture",
  "Capital One Savor",
  "Discover it Cash Back",
  "Wells Fargo Active Cash",
  "Wells Fargo Autograph",
  "Bank of America Customized Cash",
  "US Bank Altitude Go",
];

function loadApiKey() {
  if (process.env.RAPIDAPI_KEY) return process.env.RAPIDAPI_KEY;
  try {
    const env = readFileSync(path.join(ROOT, ".env.local"), "utf8");
    const match = env.match(/^RAPIDAPI_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch {
    // no .env.local
  }
  console.error("Missing RAPIDAPI_KEY. Add it to .env.local or set it in the environment.");
  process.exit(1);
}

const API_KEY = loadApiKey();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(pathname) {
  const res = await fetch(`${BASE}${pathname}`, {
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": HOST,
    },
  });
  if (res.status === 429) {
    console.warn(`  rate limited on ${pathname}, waiting 5s and retrying once...`);
    await sleep(5000);
    return api(pathname);
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${pathname}: ${await res.text()}`);
  }
  return res.json();
}

const cards = [];
const failures = [];

for (const query of CARD_SEARCHES) {
  try {
    const results = await api(`/creditcard-detail-namesearch/${encodeURIComponent(query)}`);
    if (!Array.isArray(results) || results.length === 0) {
      failures.push({ query, reason: "no search results" });
      console.warn(`✗ ${query}: no search results`);
      continue;
    }
    const cardKey = results[0].cardKey;
    const detail = await api(`/creditcard-detail-bycard/${encodeURIComponent(cardKey)}`);
    // Endpoint returns an array with one element
    const card = Array.isArray(detail) ? detail[0] : detail;
    cards.push(card);
    console.log(`✓ ${query} → ${cardKey}`);
  } catch (err) {
    failures.push({ query, reason: String(err) });
    console.warn(`✗ ${query}: ${err}`);
  }
  await sleep(400); // stay under free-tier rate limits
}

mkdirSync(path.join(ROOT, "data"), { recursive: true });
const outPath = path.join(ROOT, "data", "cards.json");
writeFileSync(
  outPath,
  JSON.stringify({ fetchedAt: new Date().toISOString(), cards }, null, 2)
);

console.log(`\nWrote ${cards.length} cards to ${path.relative(ROOT, outPath)}`);
if (failures.length > 0) {
  console.warn(`${failures.length} failed:`, failures.map((f) => f.query).join(", "));
}
