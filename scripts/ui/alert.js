// scripts/ui/alert.js
let toastTimer;

export function showToast(message) {
  const toast = document.getElementById("promoToast");
  if (!toast) return;

  if (message) toast.textContent = message;

  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2000);
}
