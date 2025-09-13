import React, { useEffect, useMemo, useRef, useState } from "react";

type DbFile = {
  id: number;
  filename: string;
  url: string;
  mimetype: string | null;
  size_bytes: number | null;
  created_at?: string; // قد تكون DATE أو TIMESTAMP حسب الجدول
};

async function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

function formatSize(b?: number | null) {
  if (!b || b <= 0) return "—";
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function formatDate(d?: string) {
  if (!d) return "—";
  try {
    // يدعم تاريخ YYYY-MM-DD أو طابع زمني
    const iso = d.length <= 10 ? `${d}T00:00:00` : d;
    const dt = new Date(iso);
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}

export default function App() {
  const [files, setFiles] = useState<DbFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbNow, setDbNow] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = useState(false);

  async function fetchNow() {
    try {
      const r = await fetch("/api/test-db");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setDbNow(j.now ?? null);
    } catch (e:any) {
      setDbNow(null);
      console.warn("test-db error:", e?.message || e);
    }
  }

  async function fetchFiles() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/files");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j: DbFile[] = await r.json();
      setFiles(j);
    } catch (e:any) {
      setError(e?.message || "تعذر جلب الملفات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNow();
    fetchFiles();
  }, []);

  async function handleChosen(list: FileList | null) {
    if (!list || list.length === 0) return;
    setSaving(true);
    setError(null);

    try {
      // ارفع ملفًا واحدًا في كل مرة (يمكنك توسيعها لاحقًا)
      const f = list[0];
      const dataUrl = await readAsDataURL(f);

      const res = await fetch("/api/save-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: f.name,
          url: dataUrl,
          mimetype: f.type || null,
          size: f.size,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }

      await fetchFiles();
    } catch (e:any) {
      setError(e?.message || "تعذر حفظ الملف");
    } finally {
      setSaving(false);
      setDrag(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
    handleChosen(e.dataTransfer.files);
  }

  const cardShadow = useMemo(
    () =>
      "shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl border border-gray-200/60",
    []
  );

  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* بطاقة البروفايل */}
        <div className={`bg-white ${cardShadow} p-6 md:p-10`}>
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=320&auto=format&fit=crop"
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover ring-4 ring-fuchsia-200"
              />
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mt-4 text-fuchsia-700">
              احمد سايت
            </h1>
            <p className="text-center text-gray-600 mt-2">
              مطور واجهات أمامية متخصص في إنشاء تجارب مستخدم
              مذهلة بصريًا وسلسة وظيفيًا.
            </p>

            {/* أزرار سريعة */}
            <div className="mt-6 flex gap-3">
              <a
                className="px-5 py-2 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-700"
                href="#app"
              >
                تطبيقي الخاص
              </a>
              <a
                className="px-5 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                href="#site"
              >
                موقعي الإلكتروني
              </a>
            </div>
          </div>

          {/* منطقة الرفع */}
          <div className="mt-10">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              className={[
                "bg-gray-50 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer",
                drag ? "border-fuchsia-500 bg-fuchsia-50" : "border-gray-300",
              ].join(" ")}
              onClick={() => inputRef.current?.click()}
            >
              <div className="text-3xl mb-3">⬆️</div>
              <div className="font-medium">اسحب وأفلت ملفاتك هنا</div>
              <div className="text-sm text-gray-500 mt-1">
                أو <span className="underline">تصفح ملفاتك</span>
              </div>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleChosen(e.target.files)}
              />
            </div>

            {/* حالة و أخطاء */}
            <div className="mt-3 text-sm">
              {saving && <div className="text-indigo-600">جاري الحفظ…</div>}
              {loading && <div className="text-indigo-600">جاري الجلب…</div>}
              {error && <div className="text-rose-600">خطأ: {error}</div>}
              {dbNow && (
                <div className="text-gray-500">
                  اتصال قاعدة البيانات ناجح — الوقت:{" "}
                  {new Date(dbNow).toLocaleString()}
                </div>
              )}
            </div>

            {/* قائمة الملفات */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold">الملفات المرفوعة</h2>
                <button
                  onClick={fetchFiles}
                  className="text-sm px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300"
                >
                  تحديث
                </button>
              </div>

              {files.length === 0 ? (
                <div className="text-gray-500">لا توجد ملفات بعد.</div>
              ) : (
                <ul className="space-y-3">
                  {files.map((f) => (
                    <li
                      key={f.id}
                      className="bg-white border rounded-xl px-4 py-3 flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{f.filename}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          النوع: {f.mimetype || "—"} · الحجم:{" "}
                          {formatSize(f.size_bytes)} · التاريخ:{" "}
                          {formatDate(f.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={f.url}
                          download={f.filename}
                          className="px-3 py-1.5 rounded-md bg-fuchsia-600 text-white hover:bg-fuchsia-700 text-sm"
                        >
                          تنزيل
                        </a>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
                        >
                          فتح
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* روابط فحص سريعة */}
        <div className="text-xs text-gray-500 mt-6 space-y-1">
          <div>
            فحص الاتصال:{" "}
            <a className="underline" href="/api/test-db" target="_blank">
              /api/test-db
            </a>
          </div>
          <div>
            جلب الملفات:{" "}
            <a className="underline" href="/api/files" target="_blank">
              /api/files
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
