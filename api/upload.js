const Busboy = require("busboy");
const path = require("path");
const { put } = require("@vercel/blob");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Метод не поддержан" });
    return;
  }

  try {
    const file = await readSingleFile(req);
    if (!file) {
      res.status(400).json({ error: "Файл не найден" });
      return;
    }

    const safeName = `${Date.now()}-${file.filename.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    const blob = await put(`products/${safeName}`, file.buffer, {
      access: "public",
      contentType: file.mimeType || "application/octet-stream",
      addRandomSuffix: false,
    });

    res.status(200).json({ ok: true, path: blob.url });
  } catch {
    res.status(400).json({ error: "Ошибка загрузки" });
  }
};

function readSingleFile(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers });
    let resolved = false;

    bb.on("file", (_name, file, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      file.on("data", (data) => chunks.push(data));
      file.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolved = true;
        resolve({
          filename: path.basename(filename || "upload"),
          mimeType,
          buffer,
        });
      });
    });

    bb.on("error", (err) => {
      if (!resolved) reject(err);
    });

    bb.on("finish", () => {
      if (!resolved) resolve(null);
    });

    req.pipe(bb);
  });
}
