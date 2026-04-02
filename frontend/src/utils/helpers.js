// ── Constants ─────────────────────────────────────────────────
export const ITEMS_PER_PAGE = 8;
export const COOLDOWN_DAYS = 30;

// ── Normalizers ───────────────────────────────────────────────
export function normalizeUser(raw) {
  if (!raw) return null;
  return {
    ...raw,
    role: raw.role === "ADMIN" ? "admin" : raw.has_shop ? "shop" : "user",
  };
}

// current_tier จาก schema: TIER_1, TIER_2, TIER_3
export function tierOf(shop) {
  if (!shop) return 1;
  if (shop.current_tier === "TIER_3") return 3;
  if (shop.current_tier === "TIER_2") return 2;
  return 1;
}
