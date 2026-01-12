const { kv } = require("@vercel/kv");

// Ключ в KV для хранения списка товаров.
const KEY = "products";

module.exports = async (req, res) => {
  if (req.method === "GET") {
    // Отдаем список товаров.
    const items = (await kv.get(KEY)) || [];
    res.status(200).json(Array.isArray(items) ? items : []);
    return;
  }

  if (req.method === "POST") {
    // Создание или обновление товара по id.
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const data = normalizeProduct(body || {});
      if (!data.id || !data.title) {
        res.status(400).json({ error: "id и title обязательны" });
        return;
      }

      const items = (await kv.get(KEY)) || [];
      const list = Array.isArray(items) ? items : [];
      const index = list.findIndex((item) => item.id === data.id);
      if (index >= 0) list[index] = data;
      else list.push(data);

      await kv.set(KEY, list);
      res.status(200).json({ ok: true, items: list });
      return;
    } catch {
      res.status(400).json({ error: "Неверный JSON" });
      return;
    }
  }

  if (req.method === "DELETE") {
    // Удаление товара по id.
    const id = req.query?.id;
    if (!id) {
      res.status(400).json({ error: "id обязателен" });
      return;
    }

    const items = (await kv.get(KEY)) || [];
    const list = Array.isArray(items) ? items : [];
    const filtered = list.filter((item) => item.id !== id);
    await kv.set(KEY, filtered);
    res.status(200).json({ ok: true, items: filtered });
    return;
  }

  res.status(405).json({ error: "Метод не поддержан" });
};

function normalizeProduct(payload = {}) {
  // Нормализуем входной payload и приводим типы.
  const id = String(payload.id || "").trim();
  const title = String(payload.title || "").trim();
  const price = Number(payload.price);
  const image = String(payload.image || "").trim();
  const images = Array.isArray(payload.images)
    ? payload.images.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return {
    id,
    title,
    price: Number.isFinite(price) ? price : 0,
    image,
    images,
  };
}
