/** Primary category label from API (uses `categories[]`; falls back to legacy `category`). */
export function getMedicineCategoryLabel(med) {
  if (!med) return null;
  if (Array.isArray(med.categories) && med.categories.length > 0) {
    return med.categories[0];
  }
  return med.category || null;
}

export function formatNPR(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  return `NPR ${n.toFixed(n % 1 === 0 ? 0 : 2)}`;
}
