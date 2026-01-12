// scripts/pages/favorites.js
import { renderEmpty, renderProductGrid } from "../render.js";

const FAV_KEY = "favoriteItems";
const grid = document.getElementById("favoritesGrid");

function readFavorites() {
  const raw = localStorage.getItem(FAV_KEY);
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function localDemoProducts() {
  return [
    {
      id: "demo-1",
      title: "Демо товар",
      price: 1990,
      image: "assets/images/placeholder.png",
      images: ["assets/images/placeholder.png"],
    },
    {
      id: "demo-2",
      title: "Еще один товар",
      price: 3490,
      image: "assets/images/placeholder.png",
      images: ["assets/images/placeholder.png"],
    },
    {
      id: "demo-3",
      title: "Товар для витрины",
      price: 1590,
      image: "assets/images/placeholder.png",
      images: ["assets/images/placeholder.png"],
    },
    {
      id: "demo-4",
      title: "Новая коллекция",
      price: 4290,
      image: "assets/images/placeholder.png",
      images: ["assets/images/placeholder.png"],
    },
  ];
}

async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    if (
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1" ||
      location.protocol === "file:"
    ) {
      return localDemoProducts();
    }
    return [];
  }
}

async function renderFavorites() {
  const favoriteIds = readFavorites();
  const products = await loadProducts();
  const filtered = products.filter((item) => favoriteIds.includes(item.id));

  if (!filtered.length) {
    renderEmpty(grid, "Избранного нет.");
    return;
  }

  renderProductGrid(grid, filtered);
}

renderFavorites();
window.addEventListener("favorites:change", renderFavorites);
