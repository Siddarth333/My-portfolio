import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Github, Instagram, Linkedin, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/reveal";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Siddartha Narra" },
      {
        name: "description",
        content:
          "Start a web development, video editing or creative project with Siddartha Narra. Send a brief and get a plan, timeline and quote.",
      },
      { property: "og:title", content: "Contact — Siddartha Narra" },
      { property: "og:description", content: "Send a project brief for web, video or creative work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  service: z.string().max(60).optional(),
  message: z.string().trim().min(10, "Tell me a little more (10+ characters)").max(2000),
});

const services = ["Web development", "Video editing", "Songs / music", "Travel photography", "Something else"];

function ContactPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      service: form.get("service") ?? undefined,
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
    const { error } = await supabase.from("contact_messages").insert({ ...parsed.data, service: parsed.data.service ?? null });
    setSending(false);

    if (error) {
      toast.error("Message could not be sent. Please email me directly.");
      return;
    }
    setSent(true);
    toast.success("Message sent — I'll reply soon.");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="pt-28">
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute -top-40 left-1/4 h-[420px] w-[640px] aurora animate-float-slow opacity-40" />
          <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Let's work</p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl">
                Tell me what you want to make.
              </h1>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Reveal>
            {sent ? (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <h2 className="font-display text-2xl font-semibold">Thanks — your brief landed.</h2>
                <p className="mt-3 text-muted-foreground">I usually reply within a day.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-muted-foreground">Your name</span>
                    <input
                      name="name"
                      maxLength={100}
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                    {errors['name'] && <span className="mt-1 block text-xs text-destructive">{errors['name']}</span>}
                  </label>
                  <label className="block">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <input
                      name="email"
                      type="email"
                      maxLength={255}
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                    {errors['email'] && <span className="mt-1 block text-xs text-destructive">{errors['email']}</span>}
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm text-muted-foreground">What do you need?</span>
                  <select
                    name="service"
                    defaultValue={services[0]}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    {services.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-muted-foreground">Project details</span>
                  <textarea
                    name="message"
                    rows={6}
                    maxLength={2000}
                    className="mt-2 w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  {errors['message'] && <span className="mt-1 block text-xs text-destructive">{errors['message']}</span>}
                </label>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send brief"}
                </button>
              </form>
            )}
          </Reveal>

          <Reveal delay={120} from="right">
            <div className="space-y-3">
              {[
                { icon: Mail, label: "narrasiddartha111@gmail.com", href: "mailto:narrasiddartha111@gmail.com" },
                { icon: Phone, label: "+91 95733 10952", href: "tel:+919573310952" },
                {
                  icon: Linkedin,
                  label: "linkedin.com/in/narra-siddartha",
                  href: "https://www.linkedin.com/in/narra-siddartha-28173221b/",
                },
                { icon: Github, label: "github.com/Siddarth333", href: "https://github.com/Siddarth333" },
                { icon: Instagram, label: "instagram.com/siddarth_2520", href: "https://www.instagram.com/siddarth_2520" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-primary/50"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{label}</span>
                </a>
              ))}
              <p className="flex items-center gap-2 px-1 pt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> Hyderabad, Telangana, India
              </p>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
