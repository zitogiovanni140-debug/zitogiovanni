import { getStore } from "@netlify/blobs";

export default async (req) => {
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!/^[a-f0-9]+$/.test(id)) return new Response("Non trovato", { status: 404 });
  const store = getStore("guides");
  const index = (await store.get("_index", { type: "json" })) || [];
  const meta = index.find((g) => g.id === id);
  const data = meta && (await store.get(id, { type: "arrayBuffer" }));
  if (!data) return new Response("Non trovato", { status: 404 });
  const inline = /pdf|image|text\/plain/.test(meta.type);
  return new Response(data, {
    headers: {
      "content-type": meta.type,
      "content-disposition": `${inline ? "inline" : "attachment"}; filename="${meta.filename}"`,
      "x-content-type-options": "nosniff",
      "cache-control": "public, max-age=300",
    },
  });
};

export const config = { path: "/api/guide-file" };
