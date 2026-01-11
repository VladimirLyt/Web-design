// scripts/ui/main.js
import { renderProductGrid } from "./render.js";

// Пытаемся получить товары с API, иначе используем локальные.
async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const grid = document.getElementById("catalogGrid");
loadProducts().then((items) => renderProductGrid(grid, items));
