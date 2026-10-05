import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Loader2, Pencil, Save, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const SECTIONS = [
  { key: "web", chapter: "Chapter 1", label: "Web Dev" },
  { key: "video", chapter: "Chapter 2", label: "Video editing" },
  { key: "book", chapter: "Chapter 3.1", label: "Books & notes" },
  { key: "song", chapter: "Chapter 3.2", label: "Songs" },
  { key: "travel", chapter: "Chapter 3.3", label: "Travel photography" },
  { key: "game", chapter: "Chapter 3.4", label: "Certified Player" },
  { key: "photo", chapter: "Extra", label: "Photos" },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

export type MediaRow = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  client_name: string | null;
  tags: string[];
  published: boolean;
  allow_download: boolean;
  storage_path: string | null;
  file_url: string;
  link_url: string | null;
  sort_order: number;
  created_at: string;
};

function useMedia(category: SectionKey) {
  return useQuery({
    queryKey: ["admin-media", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_items")
        .select(
          "id, category, title, description, client_name, tags, published, allow_download, storage_path, file_url, sort_order, created_at, link_url",
        )
        .eq("category", category)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as MediaRow[];
    },
  });
}

/** Per-section media manager: upload, edit and remove files for one chapter. */
export function SectionManager({ section }: { section: (typeof SECTIONS)[number] }) {
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useMedia(section.key);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["admin-media", section.key] });
    await queryClient.invalidateQueries({ queryKey: ["media", section.key] });
  }

  async function onUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file") as File | null;
    const title = String(fd.get("title") ?? "").trim();

    if (!file || file.size === 0) { toast.error("Choose a file to upload."); return; }
    if (!title) { toast.error("Add a title."); return; }

    setUploading(true);
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${section.key}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "3600",
      ...(file.type ? { contentType: file.type } : {}),
    });
    if (uploadError) {
      setUploading(false);
      { toast.error(uploadError.message); return; }
    }

    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("media_items").insert({
      category: section.key,
      title,
      description: String(fd.get("description") ?? "").trim() || null,
      client_name: String(fd.get("client") ?? "").trim() || null,
      link_url: String(fd.get("link_url") ?? "").trim() || null,
      file_url: path,
      storage_path: path,
      tags: String(fd.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
      allow_download: fd.get("allow_download") === "on",
      published: true,
      created_by: userData.user?.id ?? null,
    });

    setUploading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Uploaded and published.");
    form.reset();
    await refresh();
  }

  async function togglePublished(row: MediaRow) {
    const { error } = await supabase.from("media_items").update({ published: !row.published }).eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    await refresh();
  }

  async function remove(row: MediaRow) {
    if (!confirm(`Delete "${row.title}"? This also removes the file.`)) return;
    if (row.storage_path) await supabase.storage.from("media").remove([row.storage_path]);
    const { error } = await supabase.from("media_items").delete().eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted.");
    await refresh();
  }

  async function openFile(row: MediaRow) {
    const path = row.storage_path ?? row.file_url;
    if (path.startsWith("http")) { window.open(path, "_blank", "noopener"); return; }
    const { data, error } = await supabase.storage.from("media").createSignedUrl(path, 3600);
    if (error || !data) { toast.error("Could not open this file."); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onUpload} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">Upload to {section.label}</h3>

        <label className="block">
          <span className="text-sm text-muted-foreground">File (any type)</span>
          <input
            name="file"
            type="file"
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:text-secondary-foreground"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-muted-foreground">Title</span>
            <input name="title" maxLength={120} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">Client / credit (optional)</span>
            <input name="client" maxLength={120} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm text-muted-foreground">Description (optional)</span>
          <textarea name="description" rows={3} maxLength={600} className="mt-2 w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm" />
        </label>

        <label className="block">
          <span className="text-sm text-muted-foreground">Website link (optional — opens when the image is clicked)</span>
          <input name="link_url" type="url" placeholder="https://example.com" maxLength={2048} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm" />
        </label>

        <label className="block">
          <span className="text-sm text-muted-foreground">Tags (comma separated)</span>
          <input name="tags" maxLength={200} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm" />
        </label>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input name="allow_download" type="checkbox" defaultChecked className="h-4 w-4" />
          Allow public download
        </label>

        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload & publish"}
        </button>
      </form>

      <div>
        <h3 className="font-display text-lg font-semibold">
          Files in {section.label} ({items?.length ?? 0})
        </h3>
        <div className="mt-4 divide-y divide-border rounded-xl border border-border">
          {isLoading && <p className="p-8 text-center text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && (items?.length ?? 0) === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">Nothing uploaded in this section yet.</p>
          )}
          {(items ?? []).map((row) =>
            editingId === row.id ? (
              <EditRow key={row.id} row={row} onDone={async () => { setEditingId(null); await refresh(); }} onCancel={() => setEditingId(null)} />
            ) : (
              <div key={row.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{row.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.client_name ?? "—"} · {new Date(row.created_at).toLocaleDateString()}
                    {row.tags.length > 0 ? ` · ${row.tags.join(", ")}` : ""}
                  </p>
                </div>
                <button onClick={() => openFile(row)} className="rounded-md border border-border p-2 text-muted-foreground hover:text-foreground" title="Open file">
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => togglePublished(row)}
                  className={`rounded-md border px-3 py-1.5 text-xs ${row.published ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
                >
                  {row.published ? "Public" : "Hidden"}
                </button>
                <button onClick={() => setEditingId(row.id)} className="rounded-md border border-border p-2 text-muted-foreground hover:text-foreground" title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => remove(row)} className="rounded-md border border-border p-2 text-muted-foreground hover:text-destructive" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function EditRow({ row, onDone, onCancel }: { row: MediaRow; onDone: () => void; onCancel: () => void }) {
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setBusy(true);

    let storagePath = row.storage_path;
    const replacement = fd.get("replacement") as File | null;
    if (replacement && replacement.size > 0) {
      const ext = replacement.name.split(".").pop() ?? "bin";
      const path = `${row.category}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, replacement, {
        cacheControl: "3600",
        ...(replacement.type ? { contentType: replacement.type } : {}),
      });
      if (upErr) {
        setBusy(false);
        { toast.error(upErr.message); return; }
      }
      if (row.storage_path) await supabase.storage.from("media").remove([row.storage_path]);
      storagePath = path;
    }

    const { error } = await supabase
      .from("media_items")
      .update({
        title: String(fd.get("title") ?? "").trim() || row.title,
        description: String(fd.get("description") ?? "").trim() || null,
        client_name: String(fd.get("client") ?? "").trim() || null,
        link_url: String(fd.get("link_url") ?? "").trim() || null,
        tags: String(fd.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
        allow_download: fd.get("allow_download") === "on",
        sort_order: Number(fd.get("sort_order") ?? 0) || 0,
        category: String(fd.get("category") ?? row.category),
        ...(storagePath !== row.storage_path ? { storage_path: storagePath, file_url: storagePath as string } : {}),
      })
      .eq("id", row.id);

    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved.");
    onDone();
  }

  return (
    <form onSubmit={save} className="space-y-4 bg-secondary/40 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-muted-foreground">Title</span>
          <input name="title" defaultValue={row.title} maxLength={120} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Client / credit</span>
          <input name="client" defaultValue={row.client_name ?? ""} maxLength={120} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block">
        <span className="text-xs text-muted-foreground">Description</span>
        <textarea name="description" defaultValue={row.description ?? ""} rows={3} maxLength={600} className="mt-1 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs text-muted-foreground">Tags</span>
          <input name="tags" defaultValue={row.tags.join(", ")} maxLength={200} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Section</span>
          <select name="category" defaultValue={row.category} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {SECTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.chapter} — {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Order</span>
          <input name="sort_order" type="number" defaultValue={row.sort_order} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block">
        <span className="text-xs text-muted-foreground">Website link (optional)</span>
        <input name="link_url" type="url" defaultValue={row.link_url ?? ""} maxLength={2048} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Replace file (optional)</span>
        <input name="replacement" type="file" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:text-secondary-foreground" />
      </label>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input name="allow_download" type="checkbox" defaultChecked={row.allow_download} className="h-4 w-4" />
        Allow public download
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-foreground">
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </form>
  );
}
