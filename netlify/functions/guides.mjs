import { getStore } from "@netlify/blobs";

// Elenco pubblico delle guide aggiunte dall'admin
export default async () => {
  const store = getStore("guides");
  const index = (await store.get("_index", { type: "json" })) || [];
  return new Response(JSON.stringify({ items: index }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" },
  });
};

export const config = { path: "/api/guides" };
