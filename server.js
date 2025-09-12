// server.js (ESM)
import express from "express";
import path from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";

// __dirname في وضع ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;

// إعداد اتصال Postgres (SSL عند الاتصال عبر الإنترنت)
const ssl =
  process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")
    ? { rejectUnauthorized: false }
    : false;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

const app = express();
app.use(express.json());

// اختبار اتصال القاعدة
app.get("/test-db", async (_req, res) => {
  try {
    const { rows } = await db.query("SELECT NOW() AS now");
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// حفظ رابط/بيانات ملف في جدول files
app.post("/save-link", async (req, res) => {
  try {
    const { filename, url, mimetype, size } = req.body || {};
    if (!filename || !url) {
      return res.status(400).json({ ok: false, error: "filename & url required" });
    }
    const sizeNum = Number.isFinite(+size) ? +size : null;

    await db.query(
      `INSERT INTO files (filename, url, mimetype, size_bytes)
       VALUES ($1, $2, $3, $4)`,
      [filename, url, mimetype || null, sizeNum]
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// عرض آخر 200 سجل
app.get("/files", async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, filename, url, mimetype, size_bytes, created_at
       FROM files
       ORDER BY id DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// تقديم واجهة Vite المبنية
const staticDir = path.join(__dirname, "dist");
app.use(express.static(staticDir));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});
