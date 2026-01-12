const { kv } = require("@vercel/kv");

// Ключ в KV для хранения заказов.
const KEY = "orders";

module.exports = async (req, res) => {
  if (req.method === "GET") {
    // Отдаем заказы для clientId (или все, если не передан).
    const clientId = req.query?.clientId;
    const items = (await kv.get(KEY)) || [];
    const list = Array.isArray(items) ? items : [];
    const filtered = clientId ? list.filter((order) => order.clientId === clientId) : list;
    res.status(200).json(filtered);
    return;
  }

  if (req.method === "POST") {
    // Создаем новый заказ.
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const data = normalizeOrder(body || {});
      if (!data.clientId || !data.items.length) {
        res.status(400).json({ error: "clientId и items обязательны" });
        return;
      }

      const items = (await kv.get(KEY)) || [];
      const list = Array.isArray(items) ? items : [];
      const order = {
        id: `order-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...data,
      };

      list.unshift(order);
      await kv.set(KEY, list);
      res.status(200).json({ ok: true, order });
      return;
    } catch {
      res.status(400).json({ error: "Неверный JSON" });
      return;
    }
  }

  if (req.method === "DELETE") {
    // Удаляем все заказы конкретного clientId.
    const clientId = req.query?.clientId;
    if (!clientId) {
      res.status(400).json({ error: "clientId обязателен" });
      return;
    }

    const items = (await kv.get(KEY)) || [];
    const list = Array.isArray(items) ? items : [];
    const filtered = list.filter((order) => order.clientId !== clientId);
    await kv.set(KEY, filtered);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Метод не поддержан" });
};

function normalizeOrder(payload = {}) {
  // Приводим типы и формируем структуру заказа.
  const clientId = String(payload.clientId || "").trim();
  const items = Array.isArray(payload.items) ? payload.items : [];
  const total = Number(payload.total);

  return {
    clientId,
    items,
    total: Number.isFinite(total) ? total : 0,
  };
}
