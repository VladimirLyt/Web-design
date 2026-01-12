// scripts/main.js
import { renderProductGrid } from "./render.js";

// Пытаемся получить товары с API, иначе показываем демо-данные локально.
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
    return [];
  }
}

const grid = document.getElementById("catalogGrid");
loadProducts().then((items) => renderProductGrid(grid, items));
