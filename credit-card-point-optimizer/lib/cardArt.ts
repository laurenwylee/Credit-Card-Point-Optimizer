// Visual identity for each card face. Gradients approximate each product's
// real-world design language so the wallet reads as authentic at a glance.
export interface CardArt {
  background: string;
  text: string;
  subtleText: string;
  network: "amex" | "visa" | "mastercard" | "discover";
}

const DARK_TEXT = "#2B2416";
const LIGHT_TEXT = "#FFFFFF";

export const cardArt: Record<string, CardArt> = {
  "amex-gold": {
    background: "linear-gradient(135deg, #E8CD82 0%, #C9A95C 55%, #B3924A 100%)",
    text: DARK_TEXT,
    subtleText: "rgba(43,36,22,0.62)",
    network: "amex",
  },
  "amex-platinum": {
    background: "linear-gradient(135deg, #EDF0F3 0%, #C9CFD7 55%, #AEB6C0 100%)",
    text: "#2E3338",
    subtleText: "rgba(46,51,56,0.6)",
    network: "amex",
  },
  "amex-blue-cash-preferred": {
    background: "linear-gradient(135deg, #3D7EDB 0%, #2559B0 60%, #1B4590 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.65)",
    network: "amex",
  },
  "chase-sapphire-preferred": {
    background: "linear-gradient(135deg, #1D5C8F 0%, #12395B 60%, #0D2B46 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.6)",
    network: "visa",
  },
  "chase-sapphire-reserve": {
    background: "linear-gradient(135deg, #33373E 0%, #1B1D21 60%, #121316 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.55)",
    network: "visa",
  },
  "chase-freedom-unlimited": {
    background: "linear-gradient(135deg, #1683E0 0%, #0E5AA7 60%, #0A4784 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.65)",
    network: "visa",
  },
  "chase-freedom-flex": {
    background: "linear-gradient(135deg, #35A3D4 0%, #1A7AAB 60%, #135F87 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.65)",
    network: "mastercard",
  },
  "citi-double-cash": {
    background: "linear-gradient(135deg, #8B95A3 0%, #66707E 60%, #525B68 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.65)",
    network: "mastercard",
  },
  "citi-custom-cash": {
    background: "linear-gradient(135deg, #2E5490 0%, #1D3A6B 60%, #152C54 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.62)",
    network: "mastercard",
  },
  "capital-one-venture": {
    background: "linear-gradient(135deg, #33475E 0%, #1F2E40 60%, #16222F 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.6)",
    network: "visa",
  },
  "capital-one-savor": {
    background: "linear-gradient(135deg, #C0693F 0%, #99502C 60%, #7C3F21 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.65)",
    network: "mastercard",
  },
  "discover-it-cash-back": {
    background: "linear-gradient(135deg, #F68C3C 0%, #EA6A1F 60%, #D1590F 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.7)",
    network: "discover",
  },
  "wells-fargo-active-cash": {
    background: "linear-gradient(135deg, #D71E28 0%, #AD1219 60%, #8C0E14 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.68)",
    network: "visa",
  },
  "wells-fargo-autograph": {
    background: "linear-gradient(135deg, #3A404A 0%, #23272E 60%, #191C21 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.58)",
    network: "visa",
  },
  "bofa-customized-cash": {
    background: "linear-gradient(135deg, #B22234 0%, #8C1D2F 60%, #6F1624 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.65)",
    network: "visa",
  },
  "us-bank-altitude-go": {
    background: "linear-gradient(135deg, #2A4BA8 0%, #1B3480 60%, #132761 100%)",
    text: LIGHT_TEXT,
    subtleText: "rgba(255,255,255,0.65)",
    network: "visa",
  },
};

// Real card art in public/cards/, keyed by cardKey. Cards absent from this
// map fall back to the CSS-gradient face. zoom crops away margins/shadows
// baked into a source image so every face renders full-bleed.
const CARD_IMAGES: Record<string, { ext: string; zoom?: number }> = {
  "amex-gold": { ext: "png" },
  "amex-platinum": { ext: "png" },
  "amex-blue-cash-preferred": { ext: "avif" },
  "chase-sapphire-preferred": { ext: "png" },
  "chase-sapphire-reserve": { ext: "png", zoom: 1.22 },
  "chase-freedom-unlimited": { ext: "jpg", zoom: 1.08 },
  "chase-freedom-flex": { ext: "webp" },
  "citi-double-cash": { ext: "webp" },
  "citi-custom-cash": { ext: "webp" },
  "capital-one-venture": { ext: "avif" },
  "capital-one-savor": { ext: "avif" },
  "discover-it-cash-back": { ext: "avif" },
  "wells-fargo-active-cash": { ext: "png" },
  "wells-fargo-autograph": { ext: "png" },
  "bofa-customized-cash": { ext: "jpeg" },
  "us-bank-altitude-go": { ext: "webp" },
};

export function imageFor(cardKey: string): { src: string; zoom: number } | null {
  const entry = CARD_IMAGES[cardKey];
  return entry ? { src: `/cards/${cardKey}.${entry.ext}`, zoom: entry.zoom ?? 1.02 } : null;
}

export const FALLBACK_ART: CardArt = {
  background: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
  text: LIGHT_TEXT,
  subtleText: "rgba(255,255,255,0.6)",
  network: "visa",
};

export function artFor(cardKey: string): CardArt {
  return cardArt[cardKey] ?? FALLBACK_ART;
}
