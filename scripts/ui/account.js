// scripts/ui/account.js
const list = document.getElementById("ordersList");
const clearButton = document.getElementById("clearOrders");
const CLIENT_KEY = "clientId";

function getClientId() {
  let id = localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id = `client-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

function formatPrice(value) {
  return `${value} ₽`;
}

function renderEmpty() {
  list.textContent = "Заказов пока нет.";
}

function renderOrder(order) {
  const card = document.createElement("article");
  card.className = "order-card";

  const meta = document.createElement("div");
  meta.className = "order-card__meta";
  const id = document.createElement("span");
  id.textContent = order.id;
  const date = document.createElement("span");
  const dateValue = new Date(order.createdAt);
  date.textContent = dateValue.toLocaleString("ru-RU");
  meta.append(id, date);

  const items = document.createElement("div");
  items.className = "order-card__items";
  for (const item of order.items) {
    const row = document.createElement("div");
    row.className = "order-item";
    const title = document.createElement("span");
    title.textContent = `${item.title} × ${item.qty || 1}`;
    const price = document.createElement("span");
    price.textContent = formatPrice(item.price * (item.qty || 1));
    row.append(title, price);
    items.appendChild(row);
  }

  const total = document.createElement("div");
  total.className = "order-card__total";
  total.textContent = `Итого: ${formatPrice(order.total)}`;

  card.append(meta, items, total);
  return card;
}

async function loadOrders() {
  const res = await fetch(`/api/orders?clientId=${encodeURIComponent(getClientId())}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

loadOrders().then((orders) => {
  list.innerHTML = "";
  if (!orders.length) {
    renderEmpty();
    return;
  }
  orders.forEach((order) => list.appendChild(renderOrder(order)));
});

async function clearOrders() {
  await fetch(`/api/orders?clientId=${encodeURIComponent(getClientId())}`, {
    method: "DELETE",
  });
  list.innerHTML = "";
  renderEmpty();
}

if (clearButton) {
  clearButton.addEventListener("click", clearOrders);
}
