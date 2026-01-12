// scripts/components/buttons.js
export function createButton({ label = "Кнопка", variant = "primary", type = "button" } = {}) {
  const btn = document.createElement("button");
  const variantClass = variant ? `button--${variant}` : "";

  // Формируем классы, чтобы переиспользовать один компонент с разными стилями.
  btn.className = ["button", variantClass].filter(Boolean).join(" ");
  btn.type = type;
  btn.textContent = label;

  return btn;
}
