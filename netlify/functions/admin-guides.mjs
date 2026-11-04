import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";
import { isAuthed, json } from "../lib/auth.mjs";

const MAX = 5 * 1024 * 1024; // limite delle Netlify Functions ~6 MB
const ALLOWED = /\.(pdf|md|txt|docx?|xlsx?|pptx?|zip|png|jpe?g|webp|csv|json)$/i;

export default async (req) => {
  if (!isAuthed(req)) return json({ error: "Non autorizzato" }, 401);
  const store = getStore("guides");
  const index = (await store.get("_index", { type: "json" })) || [];

  if (req.method === "POST") {
    let form;
    try { form = await req.formData(); } catch { return json({ error: "Richiesta non valida" }, 400); }
    const file = form.get("file");
    const title = String(form.get("title") || "").trim().slice(0, 120);
    const description = String(form.get("description") || "").trim().slice(0, 400);
    const tag = String(form.get("tag") || "Guida").trim().slice(0, 30);
    if (!file || typeof file === "string") return json({ error: "Seleziona un file" }, 400);
    if (!title) return json({ error: "Inserisci un titolo" }, 400);
    if (!ALLOWED.test(file.name)) return json({ error: "Formato non consentito" }, 400);
    if (file.size > MAX) return json({ error: "File troppo grande (max 5 MB)" }, 413);

    const id = crypto.randomBytes(8).toString("hex");
    const item = {
      id, title, description, tag,
      filename: file.name.replace(/[^\w.\- ]+/g, "_"),
      type: file.type || "application/octet-stream",
      size: file.size,
      date: new Date().toISOString(),
    };
    await store.set(id, await file.arrayBuffer());
    await store.setJSON("_index", [item, ...index]);
    return json({ ok: true, item });
  }

  if (req.method === "DELETE") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id || !/^[a-f0-9]+$/.test(id)) return json({ error: "ID non valido" }, 400);
    await store.delete(id);
    await store.setJSON("_index", index.filter((g) => g.id !== id));
    return json({ ok: true });
  }

  return json({ error: "Metodo non consentito" }, 405);
};

export const config = { path: "/api/admin-guides" };
