import { isAuthed, json } from "../lib/auth.mjs";

const API = "https://api.netlify.com/api/v1";

export default async (req, context) => {
  if (!isAuthed(req)) return json({ error: "Non autorizzato" }, 401);
  const token = process.env.NETLIFY_API_TOKEN;
  const siteId = context?.site?.id || process.env.SITE_ID;
  if (!token || !siteId) return json({ error: "Manca NETLIFY_API_TOKEN (o SITE_ID) nelle variabili ambiente." }, 500);
  const headers = { Authorization: `Bearer ${token}` };
  const url = new URL(req.url);

  if (req.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id || !/^[a-f0-9]+$/i.test(id)) return json({ error: "ID non valido" }, 400);
    const r = await fetch(`${API}/submissions/${id}`, { method: "DELETE", headers });
    return r.ok ? json({ ok: true }) : json({ error: "Eliminazione fallita" }, 502);
  }

  if (req.method !== "GET") return json({ error: "Metodo non consentito" }, 405);
  const out = [];
  for (let page = 1; page <= 5; page++) {
    const r = await fetch(`${API}/sites/${siteId}/submissions?per_page=100&page=${page}`, { headers });
    if (!r.ok) return json({ error: `Netlify API ${r.status}: controlla il token.` }, 502);
    const items = await r.json();
    out.push(...items);
    if (items.length < 100) break;
  }
  const list = out
    .filter((s) => s.form_name === "contatto")
    .map((s) => ({
      id: s.id,
      date: s.created_at,
      nome: s.data?.nome || "",
      email: s.data?.email || "",
      servizio: s.data?.servizio || "",
      messaggio: s.data?.messaggio || "",
    }));
  return json({ items: list });
};

export const config = { path: "/api/submissions" };
