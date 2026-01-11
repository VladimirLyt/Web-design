const { kv } = require("@vercel/kv");

const KEY = "orders";

module.exports = async (req, res) => {
  if (req.method === "GET") {
    const clientId = req.query?.clientId;
    const items = (await kv.get(KEY)) || [];
    const list = Array.isArray(items) ? items : [];
    const filtered = clientId ? list.filter((order) => order.clientId === clientId) : list;
    res.status(200).json(filtered);
    return;
  }

  if (req.method === "POST") {
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

  res.status(405).json({ error: "Метод не поддержан" });
};

function normalizeOrder(payload = {}) {
  const clientId = String(payload.clientId || "").trim();
  const items = Array.isArray(payload.items) ? payload.items : [];
  const total = Number(payload.total);

  return {
    clientId,
    items,
    total: Number.isFinite(total) ? total : 0,
  };
}
