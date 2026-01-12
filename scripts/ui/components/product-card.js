// scripts/ui/components/product-card.js
import { createButton } from "./buttons.js";

const CART_KEY = "cartItems";
const FAV_KEY = "favoriteItems";

export function createProductCard(product = {}) {
  const {
    id = "",
    title = "Название товара",
    price = 0,
    image = "",
    images = [],
  } = product;

  // Собираем список картинок с запасным вариантом.
  const fallbackImage = "assets/images/placeholder.png";
  const imageList = Array.isArray(images) && images.length ? images : [image].filter(Boolean);
  const normalizedImages = imageList.length ? imageList : [fallbackImage];

  const card = document.createElement("article");
  card.className = "product-card";
  if (id) card.dataset.id = id;

  const imgWrap = document.createElement("div");
  imgWrap.className = "product-card__media";

  const img = document.createElement("img");
  img.className = "product-card__img";
  img.src = normalizedImages[0];
  img.alt = title;
  img.loading = "lazy";

  imgWrap.appendChild(img);

  const body = document.createElement("div");
  body.className = "product-card__body";

  const name = document.createElement("h3");
  name.className = "product-card__title";
  name.textContent = title;

  const priceEl = document.createElement("p");
  priceEl.className = "product-card__price";
  priceEl.textContent = `${price} ₽`;

  const meta = document.createElement("div");
  meta.className = "product-card__meta";

  const favorite = document.createElement("button");
  favorite.className = "product-card__favorite";
  favorite.type = "button";
  favorite.setAttribute("aria-label", "В избранное");
  favorite.setAttribute("aria-pressed", "false");

  const favoriteIcon = document.createElement("img");
  favoriteIcon.className = "product-card__favorite-icon";
  favoriteIcon.src = "assets/icons/heart.svg";
  favoriteIcon.alt = "";
  favorite.appendChild(favoriteIcon);

  meta.append(priceEl, favorite);

  const info = document.createElement("div");
  info.className = "product-card__info";
  info.append(meta, name);

  const actions = document.createElement("div");
  actions.className = "product-card__actions";

  const dots = document.createElement("div");
  dots.className = "product-card__dots";
  const dotItems = [];
  const dotCount = Math.max(1, normalizedImages.length);
  for (let i = 0; i < dotCount; i += 1) {
    const dot = document.createElement("span");
    dot.className = "product-card__dot";
    if (i === 0) dot.classList.add("product-card__dot--active");
    dots.appendChild(dot);
    dotItems.push(dot);
  }

  imgWrap.appendChild(dots);

  // Подсветка точки и смена картинки по позиции курсора.
  function setActiveDot(index) {
    dotItems.forEach((dot, idx) => {
      dot.classList.toggle("product-card__dot--active", idx === index);
    });
  }

  imgWrap.addEventListener("mousemove", (event) => {
    const rect = imgWrap.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const segment = rect.width / dotItems.length;
    const index = Math.min(dotItems.length - 1, Math.max(0, Math.floor(x / segment)));
    setActiveDot(index);
    img.src = normalizedImages[index] || normalizedImages[0];
  });

  imgWrap.addEventListener("mouseleave", () => {
    setActiveDot(0);
    img.src = normalizedImages[0];
  });

  let touchStartX = 0;
  let touchIndex = 0;

  imgWrap.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    const active = dotItems.findIndex((dot) => dot.classList.contains("product-card__dot--active"));
    touchIndex = active >= 0 ? active : 0;
  }, { passive: true });

  imgWrap.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartX;
    if (Math.abs(deltaX) < 25) return;

    if (deltaX < 0) touchIndex += 1;
    else touchIndex -= 1;

    touchIndex = Math.max(0, Math.min(dotItems.length - 1, touchIndex));
    setActiveDot(touchIndex);
    img.src = normalizedImages[touchIndex] || normalizedImages[0];
  });

  body.append(info, actions);
  card.append(imgWrap, body);

  function resolveCover() {
    if (normalizedImages.length) return normalizedImages[0];
    return fallbackImage;
  }

  // Читаем корзину из localStorage.
  function readCart() {
    const raw = localStorage.getItem(CART_KEY);
    let items = [];
    try {
      const parsed = JSON.parse(raw || "[]");
      items = Array.isArray(parsed) ? parsed : [];
    } catch {
      items = [];
    }
    return items;
  }

  // Записываем корзину и уведомляем слушателей.
  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cart:change"));
  }

  // Обновляем количество товара или удаляем при нуле.
  function upsertItem(nextQty) {
    const items = readCart();
    const index = items.findIndex((item) => item.id === id);
    if (nextQty <= 0) {
      if (index >= 0) items.splice(index, 1);
      writeCart(items);
      return null;
    }

    const entry = {
      id,
      title,
      price,
      image: resolveCover(),
      qty: nextQty,
    };

    if (index >= 0) items[index] = entry;
    else items.push(entry);

    writeCart(items);
    return entry;
  }

  // Рендерим кнопку или счетчик в зависимости от наличия в корзине.
  function renderActions() {
    actions.innerHTML = "";
    const items = readCart();
    const current = items.find((item) => item.id === id);
    const qty = current?.qty || 0;

    if (qty <= 0) {
      const isMobile = window.matchMedia("(max-width: 640px)").matches;
      const addToCartButton = createButton({
        label: isMobile ? "В корзину" : "Добавить в корзину",
        variant: "primary",
      });
      addToCartButton.classList.add("product-card__cta");
      addToCartButton.addEventListener("click", () => {
        upsertItem(1);
        renderActions();
      });
      actions.append(addToCartButton);
      return;
    }

    const qtyControl = document.createElement("div");
    qtyControl.className = "product-card__qty";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "–";

    const count = document.createElement("span");
    count.textContent = String(qty);

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";

    minus.addEventListener("click", () => {
      const next = qty - 1;
      upsertItem(next);
      renderActions();
    });

    plus.addEventListener("click", () => {
      const next = qty + 1;
      upsertItem(next);
      renderActions();
    });

    qtyControl.append(minus, count, plus);
    actions.append(qtyControl);
  }

  function readFavorites() {
    const raw = localStorage.getItem(FAV_KEY);
    try {
      const parsed = JSON.parse(raw || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeFavorites(items) {
    localStorage.setItem(FAV_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("favorites:change"));
  }

  function updateFavoriteState(isActive) {
    favorite.classList.toggle("product-card__favorite--active", isActive);
    favorite.setAttribute("aria-pressed", String(isActive));
    favoriteIcon.src = isActive ? "assets/icons/heart1.svg" : "assets/icons/heart.svg";
  }

  function toggleFavorite() {
    if (!id) return;
    const items = readFavorites();
    const index = items.indexOf(id);
    if (index >= 0) items.splice(index, 1);
    else items.push(id);
    writeFavorites(items);
    updateFavoriteState(items.includes(id));
  }

  updateFavoriteState(readFavorites().includes(id));
  favorite.addEventListener("click", toggleFavorite);

  renderActions();
  window.addEventListener("cart:change", renderActions);

  return card;
}
