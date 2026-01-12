// scripts/ui/cart.js
const STORAGE_KEY = "cartItems";
const itemsRoot = document.getElementById("cartItems");
const subtotalEl = document.getElementById("cartSubtotal");
const discountEl = document.getElementById("cartDiscount");
const totalEl = document.getElementById("cartTotal");
const promoInput = document.querySelector(".promo-card__input");
const promoApply = document.querySelector(".promo-card__apply");
const payButton = document.querySelector(".summary-card__pay");
import { showToast } from "./alert.js";
const PROMO_KEY = "cartPromo";
const PROMOS = {
  PROMO10: 0.1,
  SALE20: 0.2,
  VIP5: 0.05,
};
const CLIENT_KEY = "clientId";

// Чтение корзины из localStorage.
function readCart() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getClientId() {
  let id = localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id = `client-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

async function placeOrder() {
  const items = readCart();
  if (!items.length) return;
  const totals = calcTotals(items);

  await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: getClientId(),
      items,
      total: totals.total,
    }),
  });

  localStorage.removeItem("cartItems");
  localStorage.removeItem(PROMO_KEY);
  render();
}

// Запись корзины и уведомление UI.
function writeCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:change"));
}

function formatPrice(value) {
  return `${value} ₽`;
}

// Пересчет итогов корзины.
function calcTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
  const discount = Math.round(subtotal * getPromoDiscount());
  const total = subtotal - discount;
  return { subtotal, discount, total };
}

function renderEmpty() {
  itemsRoot.innerHTML = "<p>Корзина пуста.</p>";
}

// Рендер одной позиции корзины.
function createItem(item) {
  const card = document.createElement("article");
  card.className = "cart-item";

  const media = document.createElement("div");
  media.className = "cart-item__media";

  const img = document.createElement("img");
  img.className = "cart-item__img";
  img.src = item.image || "assets/images/placeholder.png";
  img.alt = item.title;
  media.appendChild(img);

  const info = document.createElement("div");
  info.className = "cart-item__info";

  const title = document.createElement("div");
  title.className = "cart-item__title";
  title.textContent = item.title;

  const price = document.createElement("div");
  price.className = "cart-item__price";
  price.textContent = formatPrice(item.price);

  info.append(title, price);

  const actions = document.createElement("div");
  actions.className = "cart-item__actions";

  const remove = document.createElement("button");
  remove.className = "cart-item__icon";
  remove.type = "button";
  remove.textContent = "🗑";
  remove.setAttribute("aria-label", "Удалить");

  const qty = document.createElement("div");
  qty.className = "cart-item__qty";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.textContent = "–";

  const count = document.createElement("span");
  count.textContent = String(item.qty || 1);

  const plus = document.createElement("button");
  plus.type = "button";
  plus.textContent = "+";

  qty.append(minus, count, plus);
  actions.append(remove, qty);

  remove.addEventListener("click", () => {
    const items = readCart().filter((entry) => entry.id !== item.id);
    writeCart(items);
    render();
  });

  plus.addEventListener("click", () => {
    const items = readCart();
    const target = items.find((entry) => entry.id === item.id);
    if (target) target.qty = (target.qty || 1) + 1;
    writeCart(items);
    render();
  });

  minus.addEventListener("click", () => {
    const items = readCart();
    const target = items.find((entry) => entry.id === item.id);
    if (target) {
      const next = (target.qty || 1) - 1;
      if (next <= 0) {
        const filtered = items.filter((entry) => entry.id !== item.id);
        writeCart(filtered);
      } else {
        target.qty = next;
        writeCart(items);
      }
    }
    render();
  });

  card.append(media, info, actions);
  return card;
}

// Полная перерисовка списка и итогов.
function render() {
  const items = readCart();
  itemsRoot.innerHTML = "";

  if (!items.length) {
    renderEmpty();
  } else {
    items.forEach((item) => itemsRoot.appendChild(createItem(item)));
  }

  const totals = calcTotals(items);
  subtotalEl.textContent = formatPrice(totals.subtotal);
  discountEl.textContent = formatPrice(totals.discount);
  totalEl.textContent = formatPrice(totals.total);
}

render();
window.addEventListener("cart:change", render);

function getPromoDiscount() {
  const stored = localStorage.getItem(PROMO_KEY);
  return PROMOS[stored] || 0;
}

function applyPromo() {
  const items = readCart();
  if (!items.length) {
    showToast("Добавьте товар");
    return;
  }

  const value = (promoInput?.value || "").trim().toUpperCase();
  if (PROMOS[value]) {
    localStorage.setItem(PROMO_KEY, value);
    showToast("Промокод применен");
  } else {
    localStorage.removeItem(PROMO_KEY);
  }
  render();
}

if (promoApply && promoInput) {
  promoApply.addEventListener("click", applyPromo);
  promoInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyPromo();
    }
  });
}

if (payButton) {
  payButton.addEventListener("click", placeOrder);
}
