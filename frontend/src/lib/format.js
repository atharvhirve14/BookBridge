/** MongoDB ObjectIds are 24 hex chars — show a short, friendly order number. */
export function shortId(id) {
  return id.slice(-6).toUpperCase();
}
