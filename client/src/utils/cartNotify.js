/** Fires when the shopping cart changes (same-tab updates for nav badge). */
export function notifyCartUpdated() {
  window.dispatchEvent(new Event('pharmacare-cart'));
}
