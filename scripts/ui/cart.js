// scripts/ui/cart.js
const STORAGE_KEY = "cartItems";
const itemsRoot = document.getElementById("cartItems");
const subtotalEl = document.getElementById("cartSubtotal");
const discountEl = document.getElementById("cartDiscount");
const totalEl = document.getElementById("cartTotal");

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
  const discount = 0;
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
