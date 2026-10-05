import { useState } from "react";
import { z } from "zod";
import { Loader2, Paperclip, Send, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(40).optional(),
  budget: z.string().trim().max(60).optional(),
  message: z.string().trim().min(10, "Tell me a little more (10+ characters)").max(3000),
});

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_FILES = 6;

type Props = {
  category: "web" | "video";
  heading: string;
  blurb: string;
};

/**
 * Public request form for the service chapters. Visitors describe the job and
 * can attach reference files, which land in a private requests folder that only
 * the studio owner can open.
 */
export function RequestForm({ category, heading, blurb }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    const tooBig = picked.find((f) => f.size > MAX_FILE_BYTES);
    if (tooBig) {
      toast.error(`"${tooBig.name}" is larger than 50 MB.`);
      return;
    }
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_FILES));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone") || undefined,
      budget: form.get("budget") || undefined,
      message: form.get("message"),
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }

    setErrors({});
    setSending(true);

    const uploaded: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `requests/${category}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        ...(file.type ? { contentType: file.type } : {}),
      });
      if (error) {
        setSending(false);
        toast.error(`Could not upload "${file.name}". ${error.message}`);
        return;
      }
      uploaded.push(`${path}::${file.name}`);
    }

    const { error } = await supabase.from("project_requests").insert({
      category,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      budget: parsed.data.budget ?? null,
      message: parsed.data.message,
      attachments: uploaded,
    });

    setSending(false);
    if (error) {
      toast.error("Request could not be sent. Please email me directly.");
      return;
    }
    setSent(true);
    setFiles([]);
    toast.success("Request sent — I'll reply soon.");
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <h3 className="font-display text-2xl font-semibold">Your request landed.</h3>
        <p className="mt-3 text-muted-foreground">I go through every brief and usually reply within a day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6 sm:p-8">
      <div>
        <h3 className="font-display text-2xl font-semibold">{heading}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{blurb}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-muted-foreground">Your name</span>
          <input name="name" maxLength={100} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
          {errors['name'] && <span className="mt-1 block text-xs text-destructive">{errors['name']}</span>}
        </label>
        <label className="block">
          <span className="text-sm text-muted-foreground">Email</span>
          <input name="email" type="email" maxLength={255} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
          {errors['email'] && <span className="mt-1 block text-xs text-destructive">{errors['email']}</span>}
        </label>
        <label className="block">
          <span className="text-sm text-muted-foreground">Phone / WhatsApp (optional)</span>
          <input name="phone" maxLength={40} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-sm text-muted-foreground">Budget or deadline (optional)</span>
          <input name="budget" maxLength={60} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-muted-foreground">Project details</span>
        <textarea name="message" rows={6} maxLength={3000} className="mt-2 w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
        {errors['message'] && <span className="mt-1 block text-xs text-destructive">{errors['message']}</span>}
      </label>

      <div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <Paperclip className="h-4 w-4" /> Attach files
          <input type="file" multiple className="hidden" onChange={onPick} />
        </label>
        <span className="ml-3 text-xs text-muted-foreground">Any file type, up to 50 MB each ({MAX_FILES} max).</span>
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-xs">
                <span className="min-w-0 flex-1 truncate">{f.name}</span>
                <span className="text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {sending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
