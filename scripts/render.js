// scripts/render.js
import { createProductCard } from "./components/product-card.js";

export function clear(node) {
  if (!node) return;
  node.innerHTML = "";
}

// Быстро добавляем много элементов через фрагмент.
export function mountMany(node, elements = []) {
  if (!node) return;
  const frag = document.createDocumentFragment();
  for (const el of elements) frag.appendChild(el);
  node.appendChild(frag);
}

export function renderEmpty(node, text = "Товаров нет") {
  if (!node) return;
  clear(node);

  const div = document.createElement("div");
  div.className = "empty-state";
  div.textContent = text;

  node.appendChild(div);
}

export function renderProductGrid(container, products) {
  if (!container) return;

  if (!Array.isArray(products) || products.length === 0) {
    renderEmpty(container);
    return;
  }

  const cards = products.map((p) => createProductCard(p));

  clear(container);
  mountMany(container, cards);
}
