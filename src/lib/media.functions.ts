import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CATEGORIES = ["web", "video", "photo", "song", "travel", "book", "game"] as const;

const listSchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  limit: z.number().int().min(1).max(60).optional(),
});

export type MediaCategory = (typeof CATEGORIES)[number];

/** How the file should be presented, derived from its extension. */
export type MediaKind = "video" | "audio" | "image" | "pdf";

export type PublicMediaItem = {
  id: string;
  category: MediaCategory;
  kind: MediaKind;
  title: string;
  description: string | null;
  client_name: string | null;
  tags: string[];
  featured: boolean;
  allow_download: boolean;
  created_at: string;
  url: string;
  thumbnail: string | null;
  link_url: string | null;
};

function kindFor(path: string | null, category: string): MediaKind {
  const ext = (path ?? "").split("?")[0]?.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4", "mov", "webm", "m4v", "avi", "mkv"].includes(ext)) return "video";
  if (["mp3", "wav", "m4a", "aac", "ogg", "flac"].includes(ext)) return "audio";
  if (["pdf"].includes(ext)) return "pdf";
  if (["jpg", "jpeg", "png", "webp", "gif", "avif", "heic"].includes(ext)) return "image";
  if (category === "video") return "video";
  if (category === "web") return "image";
  if (category === "song") return "audio";
  if (category === "book") return "pdf";
  return "image";
}

function serverClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return { url, key };
}

export const listMedia = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => listSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<PublicMediaItem[]> => {
    const { createClient } = await import("@supabase/supabase-js");
    const { url, key } = serverClient();

    const supabasePublic = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    let query = supabasePublic
      .from("media_items")
      .select(
        "id, category, title, description, file_url, storage_path, thumbnail_url, client_name, tags, featured, allow_download, created_at, sort_order, link_url",
      )
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 48);

    if (data.category) query = query.eq("category", data.category);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) return [];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const paths = rows
      .flatMap((r) => [r.storage_path, r.thumbnail_url])
      .filter((p): p is string => Boolean(p) && !String(p).startsWith("http"));

    const signed = new Map<string, string>();
    if (paths.length > 0) {
      const { data: urls } = await supabaseAdmin.storage
        .from("media")
        .createSignedUrls(Array.from(new Set(paths)), 60 * 60 * 6);
      for (const u of urls ?? []) {
        if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
      }
    }

    const resolve = (value: string | null) => {
      if (!value) return null;
      if (value.startsWith("http")) return value;
      return signed.get(value) ?? null;
    };

    return rows.map((r) => ({
      id: r.id,
      category: r.category as MediaCategory,
      kind: kindFor(r.storage_path ?? r.file_url, r.category),
      title: r.title,
      description: r.description,
      client_name: r.client_name,
      tags: r.tags ?? [],
      featured: r.featured,
      allow_download: r.allow_download,
      created_at: r.created_at,
      url: resolve(r.storage_path) ?? resolve(r.file_url) ?? "",
      thumbnail: resolve(r.thumbnail_url),
      link_url: r.link_url ?? null,
    }));
  });

/** Public: the profile photo shown in the header, as a temporary signed URL. */
export const getProfilePhoto = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ url: string | null }> => {
    const { createClient } = await import("@supabase/supabase-js");
    const { url, key } = serverClient();

    const supabasePublic = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data: row } = await supabasePublic
      .from("site_settings")
      .select("value")
      .eq("key", "profile_photo_path")
      .maybeSingle();

    const path = row?.value ?? null;
    if (!path) return { url: null };
    if (path.startsWith("http")) return { url: path };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed } = await supabaseAdmin.storage.from("media").createSignedUrl(path, 60 * 60 * 6);
    return { url: signed?.signedUrl ?? null };
  },
);
