// scripts/ui/cart-badge.js
const STORAGE_KEY = "cartItems";
const badges = document.querySelectorAll("[data-cart-count]");

// Считаем общее количество товаров с учетом qty.
function getCount() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.reduce((sum, item) => sum + (item.qty || 1), 0);
    }
    const asNumber = Number(parsed);
    return Number.isFinite(asNumber) ? asNumber : 0;
  } catch {
    return 0;
  }
}

function updateBadges() {
  const count = getCount();
  badges.forEach((badge) => {
    badge.textContent = String(count);
  });
}

updateBadges();
window.addEventListener("storage", updateBadges);
window.addEventListener("cart:change", updateBadges);
