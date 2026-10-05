import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Loader2, Mail, Paperclip, Phone, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type RequestRow = {
  id: string;
  category: string;
  name: string;
  email: string;
  phone: string | null;
  budget: string | null;
  message: string;
  attachments: string[];
  status: string;
  created_at: string;
};

type ContactRow = {
  id: string;
  name: string;
  email: string;
  service: string | null;
  message: string;
  created_at: string;
};

const STATUSES = ["new", "in_progress", "done", "archived"] as const;

const CATEGORY_LABEL: Record<string, string> = {
  web: "Website creation",
  video: "Video editing",
};

/** Admin inbox: client requests from the Web Dev and Video chapters, plus contact messages. */
export function RequestsInbox() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "web" | "video">("all");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_requests")
        .select("id, category, name, email, phone, budget, message, attachments, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as RequestRow[];
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("id, name, email, service, message, created_at")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as ContactRow[];
    },
  });

  async function setStatus(row: RequestRow, status: string) {
    const { error } = await supabase.from("project_requests").update({ status }).eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
  }

  async function removeRequest(row: RequestRow) {
    if (!confirm(`Delete the request from ${row.name}?`)) return;
    const paths = row.attachments.map((a) => a.split("::")[0]!).filter(Boolean);
    if (paths.length > 0) await supabase.storage.from("media").remove(paths);
    const { error } = await supabase.from("project_requests").delete().eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Request deleted.");
    await queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
  }

  async function openAttachment(entry: string) {
    const [path] = entry.split("::");
    if (!path) return;
    const { data, error } = await supabase.storage.from("media").createSignedUrl(path, 3600, { download: true });
    if (error || !data) {
      toast.error("Could not open this attachment.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  const rows = (requests ?? []).filter((r) => filter === "all" || r.category === filter);

  return (
    <div className="space-y-10">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Client requests ({rows.length})</h2>
          <div className="flex gap-2">
            {(["all", "web", "video"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                  filter === f ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : CATEGORY_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {isLoading && (
            <div className="flex justify-center p-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {!isLoading && rows.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No client requests yet.
            </p>
          )}
          {rows.map((row) => (
            <article key={row.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded bg-secondary px-2 py-1 font-mono text-[10px] uppercase text-secondary-foreground">
                  {CATEGORY_LABEL[row.category] ?? row.category}
                </span>
                <p className="font-medium">{row.name}</p>
                <span className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</span>
                <div className="ml-auto flex items-center gap-2">
                  <select
                    value={row.status}
                    onChange={(e) => setStatus(row, e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => removeRequest(row)} className="rounded-md border border-border p-2 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <a href={`mailto:${row.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <Mail className="h-3.5 w-3.5" /> {row.email}
                </a>
                {row.phone && (
                  <a href={`tel:${row.phone}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    <Phone className="h-3.5 w-3.5" /> {row.phone}
                  </a>
                )}
                {row.budget && <span>Budget / deadline: {row.budget}</span>}
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{row.message}</p>

              {row.attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {row.attachments.map((entry) => {
                    const label = entry.split("::")[1] ?? entry.split("/").pop() ?? "file";
                    return (
                      <button
                        key={entry}
                        onClick={() => openAttachment(entry)}
                        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        <span className="max-w-[220px] truncate">{label}</span>
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold">Contact messages ({messages?.length ?? 0})</h2>
        <div className="mt-4 divide-y divide-border rounded-xl border border-border">
          {(messages ?? []).map((m) => (
            <div key={m.id} className="p-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-medium">{m.name}</span>
                <a href={`mailto:${m.email}`} className="text-xs text-muted-foreground hover:text-foreground">
                  {m.email}
                </a>
                {m.service && <span className="rounded bg-secondary px-2 py-0.5 text-[10px] uppercase">{m.service}</span>}
                <span className="ml-auto text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>
            </div>
          ))}
          {(messages?.length ?? 0) === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">No messages yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
