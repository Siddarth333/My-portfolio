import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { listMedia } from "@/lib/media.functions";
import { MediaGrid } from "@/components/media-grid";
import { Reveal } from "@/components/reveal";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Link } from "@tanstack/react-router";
import { RequestForm } from "@/components/request-form";

type Props = {
  category: "web" | "video" | "photo" | "song" | "travel" | "book" | "game";
  eyebrow: string;
  title: string;
  intro: string;
  emptyNote: string;
  /** When set, a public request form for this service is shown instead of the generic CTA. */
  requestCategory?: "web" | "video";
};

export function GalleryPage({ category, eyebrow, title, intro, emptyNote, requestCategory }: Props) {

  const fetchMedia = useServerFn(listMedia);
  const [tag, setTag] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["media", category],
    queryFn: () => fetchMedia({ data: { category } }),
  });

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const item of data ?? []) for (const t of item.tags) set.add(t);
    return Array.from(set).sort();
  }, [data]);

  const items = (data ?? []).filter((item) => !tag || item.tags.includes(tag));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="pt-28">
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 aurora animate-float-slow opacity-50" />
          <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl">{title}</h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{intro}</p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          {tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTag(null)}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                  tag === null ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                    tag === t ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-xl border border-border bg-card" />
              ))}
            </div>
          )}

          {error && <p className="text-sm text-destructive">Could not load this gallery. Please refresh.</p>}

          {!isLoading && !error && items.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">{emptyNote}</p>
              <Link
                to="/contact"
                className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Start a project
              </Link>
            </div>
          )}

          {items.length > 0 && <MediaGrid items={items} />}
        </section>

        {requestCategory ? (
          <section id="request" className="scroll-mt-28 border-t border-border">
            <div className="mx-auto max-w-3xl px-6 py-20">
              <Reveal from="scale">
                <RequestForm
                  category={requestCategory}
                  heading="Request this service"
                  blurb="Share the brief and attach any references, scripts or raw footage links. Everything stays private."
                />
              </Reveal>
            </div>
          </section>
        ) : (
          <section className="border-t border-border">
            <div className="mx-auto max-w-6xl px-6 py-20 text-center">
              <Reveal from="scale">
                <h2 className="text-3xl font-semibold sm:text-4xl">Have something in mind?</h2>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                  Tell me about the project and I'll come back with a plan, a timeline and a quote.
                </p>
                <Link
                  to="/contact"
                  className="mt-8 inline-flex rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Get in touch
                </Link>
              </Reveal>
            </div>
          </section>
        )}

      </main>
      <SiteFooter />
    </div>
  );
}
