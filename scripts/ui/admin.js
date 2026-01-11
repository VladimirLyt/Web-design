// scripts/ui/admin.js
import { createButton } from "./components/buttons.js";

const form = document.getElementById("productForm");
const list = document.getElementById("productsList");
const dropzone = document.getElementById("imageDropzone");
const fileInput = document.getElementById("imageInput");
const previews = document.getElementById("imagePreviews");
let uploadedImages = [];

// Загружаем список товаров с сервера.
async function fetchProducts() {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function renderList(items) {
  list.innerHTML = "";
  if (!items.length) {
    list.textContent = "Пока нет опубликованных товаров.";
    return;
  }

  for (const item of items) {
    const card = document.createElement("div");
    card.className = "admin__item";

    const title = document.createElement("div");
    title.className = "admin__item-title";
    title.textContent = `${item.title} (${item.id})`;

    const price = document.createElement("div");
    price.textContent = `Цена: ${item.price} ₽`;

    const image = document.createElement("div");
    const imageCount = Array.isArray(item.images) ? item.images.length : 0;
    const imageText = imageCount ? `${imageCount} шт.` : item.image || "по умолчанию";
    image.textContent = `Картинка: ${imageText}`;

    const remove = document.createElement("button");
    remove.className = "button admin__remove";
    remove.type = "button";
    remove.textContent = "Удалить";

    remove.addEventListener("click", async () => {
      await fetch(`/api/products?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const updated = await fetchProducts();
      renderList(updated);
    });

    card.append(title, price, image, remove);
    list.appendChild(card);
  }
}

function normalizeProduct(formData) {
  const id = formData.get("id").trim();
  const title = formData.get("title").trim();
  const price = Number(formData.get("price"));
  const images = uploadedImages.slice();
  const image = images[0] || "";

  // Приводим данные формы к ожидаемому формату.
  return {
    id,
    title,
    price: Number.isFinite(price) ? price : 0,
    image,
    images,
  };
}

async function uploadFile(file) {
  const data = new FormData();
  data.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: data,
  });

  if (!res.ok) throw new Error("Upload failed");
  const payload = await res.json();
  return payload.path;
}

async function handleFiles(files) {
  if (!files.length) return;
  const uploaded = [];
  for (const file of files) {
    const path = await uploadFile(file);
    uploaded.push(path);
  }

  if (previews) {
    for (const path of uploaded) {
      const wrap = document.createElement("div");
      wrap.className = "admin__preview";
      const img = document.createElement("img");
      img.src = path;
      img.alt = "";
      wrap.appendChild(img);
      previews.appendChild(wrap);
    }
  }

  if (uploaded.length) {
    uploadedImages = [...uploadedImages, ...uploaded];
  }
}

const addButton = createButton({
  label: "Опубликовать",
  variant: "primary",
});

if (form) {
  const submitButton = form.querySelector("button[type='submit']");
  if (submitButton) submitButton.replaceWith(addButton);
  addButton.type = "submit";
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Отправляем новый товар в API.
  const data = normalizeProduct(new FormData(form));
  if (!data.id || !data.title) return;

  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    const items = await fetchProducts();
    renderList(items);
    form.reset();
    uploadedImages = [];
    if (previews) previews.innerHTML = "";
  }
});

if (dropzone && fileInput) {
  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("is-dragover");
  });

  dropzone.addEventListener("drop", async (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragover");
    const files = Array.from(event.dataTransfer?.files || []);
    await handleFiles(files);
  });

  fileInput.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []);
    await handleFiles(files);
    event.target.value = "";
  });
}

fetchProducts().then(renderList);
