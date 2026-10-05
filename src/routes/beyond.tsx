import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Gamepad2, Music2, Plane } from "lucide-react";
import { listMedia } from "@/lib/media.functions";
import { MediaGrid } from "@/components/media-grid";
import { Reveal } from "@/components/reveal";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/beyond")({
  head: () => ({
    meta: [
      { title: "Beyond Code — Books, Songs, Travel & Gaming | Siddartha Narra" },
      {
        name: "description",
        content:
          "Beyond the code: written notes and books, songs, travel photography and gaming highlights by Siddartha Narra. Read, watch, listen and download.",
      },
      { property: "og:title", content: "Beyond Code — Books, Songs, Travel & Gaming" },
      {
        property: "og:description",
        content: "Notes and books, original songs, travel frames and gaming highlights by Siddartha Narra.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Beyond,
});

const sections = [
  {
    id: "books",
    category: "book" as const,
    index: "3.1",
    icon: BookOpen,
    label: "Books",
    title: "Pages written between the work.",
    intro:
      "Notes and short books written recently — thoughts, reflections and whatever life is putting in front of me. Open any PDF to read it right here, or download a copy.",
    empty: "The first pages are being typed up. They land here soon.",
  },
  {
    id: "songs",
    category: "song" as const,
    index: "3.2",
    icon: Music2,
    label: "Songs",
    title: "Songs sung at night, from films I love.",
    intro:
      "Covers and originals recorded between shoots and shipping code — audio and video. Press play on any piece, or download it where sharing is allowed.",
    empty: "The first tracks are being mastered. They land here soon.",
  },
  {
    id: "travel",
    category: "travel" as const,
    index: "3.3",
    icon: Plane,
    label: "Travel photography",
    title: "Roads, coastlines and cities, one frame at a time.",
    intro:
      "Photos and clips collected on the move, mostly shot on a phone — mountains, streets, coastlines and the small moments in between.",
    empty: "New travel sets are being edited. Check back shortly.",
  },
  {
    id: "certified-player",
    category: "game" as const,
    index: "3.4",
    icon: Gamepad2,
    label: "Certified Player",
    title: "Clutch plays, saved and replayed.",
    intro:
      "Gameplay clips and screenshots from the sessions worth keeping — clean plays, close finishes and the occasional lucky shot.",
    empty: "Highlights are being clipped. They land here soon.",
  },
];

function BeyondSection({ section }: { section: (typeof sections)[number] }) {
  const fetchMedia = useServerFn(listMedia);
  const { data, isLoading, error } = useQuery({
    queryKey: ["media", section.category],
    queryFn: () => fetchMedia({ data: { category: section.category } }),
  });

  const Icon = section.icon;

  return (
    <section id={section.id} className="scroll-mt-28 border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            {section.index} — {section.label}
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-5 flex items-start gap-4 text-3xl font-semibold leading-tight sm:text-5xl">
            <Icon className="mt-2 h-7 w-7 shrink-0 text-primary" />
            <span>{section.title}</span>
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-5 max-w-2xl text-muted-foreground">{section.intro}</p>
        </Reveal>

        <div className="mt-12">
          {isLoading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-xl border border-border bg-card" />
              ))}
            </div>
          )}
          {error && <p className="text-sm text-destructive">Could not load this section. Please refresh.</p>}
          {!isLoading && !error && (data ?? []).length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              {section.empty}
            </div>
          )}
          {(data ?? []).length > 0 && <MediaGrid items={data!} />}
        </div>
      </div>
    </section>
  );
}

function Beyond() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="pt-28">
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 aurora animate-float-slow opacity-50" />
          <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Chapter 03 — Beyond Code</p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl">
                What happens when the <span className="text-gradient">editor closes</span>.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                Four things keep the balance outside client work — writing, music, travel and games. All of them live
                here, one after the other.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-10 flex flex-wrap gap-3">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm transition-colors hover:border-primary hover:text-foreground"
                  >
                    <s.icon className="h-4 w-4 text-primary" /> {s.label}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {sections.map((s) => (
          <BeyondSection key={s.id} section={s} />
        ))}

        <section>
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <Reveal from="scale">
              <h2 className="text-3xl font-semibold sm:text-4xl">Want this energy on your project?</h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Music, motion or a website — tell me what you're building.
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
      </main>
      <SiteFooter />
    </div>
  );
}
