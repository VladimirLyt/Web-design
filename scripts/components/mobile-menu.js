// scripts/components/mobile-menu.js
const toggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");

function closeMenu() {
  if (!menu || !toggle) return;
  menu.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
}
