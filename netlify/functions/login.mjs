import { configOk, createToken, safeEqual, json } from "../lib/auth.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Metodo non consentito" }, 405);
  if (!configOk()) return json({ error: "Admin non configurato: mancano le variabili ambiente su Netlify." }, 500);
  let body = {};
  try { body = await req.json(); } catch {}
  const okEmail = safeEqual((body.email || "").trim().toLowerCase(), process.env.ADMIN_EMAIL.trim().toLowerCase());
  const okPass = safeEqual(body.password || "", process.env.ADMIN_PASSWORD);
  if (!(okEmail && okPass)) {
    await new Promise((r) => setTimeout(r, 900)); // frena i tentativi a raffica
    return json({ error: "Credenziali non valide" }, 401);
  }
  return json({ token: createToken(process.env.ADMIN_EMAIL) });
};

export const config = { path: "/api/login" };
