import crypto from "node:crypto";

const b64 = (b) => Buffer.from(b).toString("base64url");
const sign = (data) =>
  crypto.createHmac("sha256", process.env.SESSION_SECRET || "").update(data).digest("base64url");

export function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function configOk() {
  return !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET);
}

export function createToken(email, hours = 8) {
  const payload = b64(JSON.stringify({ email, exp: Date.now() + hours * 3600 * 1000 }));
  return `${payload}.${sign(payload)}`;
}

export function isAuthed(req) {
  if (!process.env.SESSION_SECRET) return false;
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
