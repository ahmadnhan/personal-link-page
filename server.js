// server.js
import express from "express";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// اتصال بقاعدة البيانات في وقت التشغيل فقط
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// فحص الاتصال
app.get("/test-db", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT NOW()");
    res.json({ ok: true, now: rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// قد يكون عندك مجلد "dist" (Vite/Next build) أو "public"
// جرّب dist أولاً، ولو ما عندك استخدم public أو الجذر
const staticDir = path.join(__dirname, "dist"); // غيّرها إلى "public" لو ما عندك dist
app.use(express.static(staticDir));

app.get("*", (req, res) => {
  // يخدم index.html لأي مسار
  const indexPath = path.join(staticDir, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) res.status(200).send("App up");
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on", PORT);
});
