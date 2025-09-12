import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;

// SSL لبوستجرس على Railway (يتعطّل محليًا)
const ssl =
  process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")
    ? { rejectUnauthorized: false }
    : undefined;

const db = new Pool({ connectionString: process.env.DATABASE_URL, ssl });

const app = express();
app.use(express.json({ limit: "20mb" }));

// ------- API -------
app.get("/api/test-db", async (_req, res) => {
  try {
    const { rows } = await db.query("SELECT NOW() AS now");
    res.json({ ok: true, now: rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/api/save-link", async (req, res) => {
  try {
    const { filename, url, mimetype, size } = req.body || {};
    if (!filename || !url) return res.status(400).json({ ok: false, error: "filename & url required" });
    const sizeNum = Number.isFinite(+size) ? +size : null;
    await db.query(
      `INSERT INTO files (filename, url, mimetype, size_bytes) VALUES ($1, $2, $3, $4)`,
      [filename, url, mimetype || null, sizeNum]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/api/files", async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, filename, url, mimetype, size_bytes, created_at
       FROM files ORDER BY id DESC LIMIT 200`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ------- Static (Vite build) -------
const staticDir = path.join(__dirname, "dist");
app.use(express.static(staticDir));

// SPA fallback لغير /api فقط
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => console.log("Server running on", PORT));
