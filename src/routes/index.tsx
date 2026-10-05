import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Clapperboard, MonitorSmartphone, Sparkles, User } from "lucide-react";
import { Reveal, useScrollY } from "@/components/reveal";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { listMedia } from "@/lib/media.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Siddartha Narra — Web Dev, Video Editing & Beyond Code" },
      {
        name: "description",
        content:
          "Web development, video editing, songs and travel photography by Siddartha Narra. Browse the work, download files and start a project.",
      },
      { property: "og:title", content: "Siddartha Narra — Web Dev, Video Editing & Beyond Code" },
      {
        property: "og:description",
        content: "Web development, video editing and creative work beyond code — browse the work and start a project.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const chapters = [
  {
    id: "web",
    to: "/web",
    index: "01",
    icon: MonitorSmartphone,
    label: "Web Dev",
    headline: "Sites engineered, not just decorated.",
    body: "From a single landing page to a full application with logins and dashboards — designed, built and deployed end to end.",
    points: ["Landing & brand sites", "Web applications", "Performance & SEO", "Deployment & care"],
  },
  {
    id: "video",
    to: "/video",
    index: "02",
    icon: Clapperboard,
    label: "Video editing",
    headline: "Cuts with rhythm, colour and weight.",
    body: "Brand films, reels, event recaps and long-form edits — assembled, graded and mixed until every second earns its place.",
    points: ["Reels & short form", "Event & wedding films", "Colour grading", "Sound & motion graphics"],
  },
  {
    id: "beyond",
    to: "/beyond",
    index: "03",
    icon: Sparkles,
    label: "Beyond Code",
    headline: "Songs, and the roads in between.",
    body: "The work that keeps the balance: original songs written and mixed at home, and travel photography collected on the move.",
    points: ["Songs — originals & covers", "Travel photography", "Listen & view full screen", "Free downloads where allowed"],
  },
  {
    id: "personal",
    to: "/personal",
    index: "04",
    icon: User,
    label: "The engineer behind it",
    headline: "Industrial automation meets software.",
    body: "Junior Engineer at Foxconn working with 6-axis robotics and PLCs, plus full-stack development in Java, Spring Boot and React.",
    points: ["Foxconn — robotics & PLC", "Java · Spring Boot · React", "B.Tech ECE, VNRVJIET", "Full résumé & projects"],
  },
] as const;

const marquee = ["Web development", "Video editing", "Beyond Code", "Songs", "Travel photography", "Colour grading", "Web apps", "Branding"];

function Home() {
  const scrollY = useScrollY();
  const fetchMedia = useServerFn(listMedia);
  const { data: featured } = useQuery({
    queryKey: ["media", "featured-home"],
    queryFn: () => fetchMedia({ data: { limit: 6 } }),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        {/* Cinematic intro */}
        <section className="relative flex min-h-[100svh] items-center overflow-hidden grid-bg">
          <div
            className="pointer-events-none absolute left-1/2 top-1/3 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 aurora animate-float-slow"
            style={{ transform: `translate3d(-50%, calc(-50% + ${scrollY * 0.18}px), 0)` }}
          />
          <div
            className="relative mx-auto w-full max-w-6xl px-6"
            style={{ transform: `translate3d(0, ${scrollY * -0.08}px, 0)`, opacity: Math.max(0, 1 - scrollY / 620) }}
          >
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">
                Hyderabad · India — web, video & beyond
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-8 max-w-4xl text-[clamp(2.6rem,8vw,5.5rem)] font-semibold leading-[0.98]">
                Stories told in <span className="text-gradient">motion</span>, light and code.
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-7 max-w-xl text-lg text-muted-foreground">
                Four chapters by Siddartha Narra — web development, video editing, the work beyond code, and the
                engineer behind all of it. Scroll to move through them.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href="#chapters"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Explore the work <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  Start a project
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            scroll
          </div>
        </section>

        {/* Marquee */}
        <div className="overflow-hidden border-y border-border py-4">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
            {[...marquee, ...marquee].map((word, i) => (
              <span key={`${word}-${i}`} className="font-display text-xl text-muted-foreground/60">
                {word} <span className="text-primary">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* Chapters */}
        <section id="chapters">
          {chapters.map((c, i) => (
            <div key={c.id} className="border-b border-border">
              <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 lg:grid-cols-2 lg:items-center">
                <Reveal from={i % 2 === 0 ? "left" : "right"} className={i % 2 === 0 ? "" : "lg:order-2"}>
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                    Chapter {c.index} — {c.label}
                  </span>
                  <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">{c.headline}</h2>
                  <p className="mt-5 max-w-lg text-muted-foreground">{c.body}</p>
                  <Link
                    to={c.to}
                    className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary"
                  >
                    Open chapter
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Reveal>

                <Reveal
                  delay={120}
                  from="scale"
                  className={i % 2 === 0 ? "" : "lg:order-1"}
                >
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 aurora opacity-50" />
                    <c.icon className="relative h-8 w-8 text-primary" />
                    <ul className="relative mt-8 space-y-3">
                      {c.points.map((p) => (
                        <li key={p} className="flex items-center gap-3 border-b border-border/60 pb-3 text-sm last:border-0">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <span className="pointer-events-none absolute bottom-4 right-6 font-display text-7xl font-semibold text-foreground/5">
                      {c.index}
                    </span>
                  </div>
                </Reveal>
              </div>
            </div>
          ))}
        </section>

        {/* Latest work strip */}
        {featured && featured.length > 0 && (
          <section className="border-b border-border">
            <div className="mx-auto max-w-6xl px-6 py-20">
              <Reveal>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Latest work</p>
              </Reveal>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.slice(0, 6).map((item, i) => (
                  <Reveal key={item.id} delay={(i % 3) * 90}>
                    <Link
                      to={item.category === "video" ? "/video" : "/beyond"}
                      className="group block overflow-hidden rounded-xl border border-border bg-card"
                    >
                      <div className="aspect-video overflow-hidden bg-secondary">
                        {item.category === "video" && !item.thumbnail ? (
                          <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <img
                            src={item.thumbnail ?? item.url}
                            alt={item.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="p-5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">{item.category}</p>
                        <h3 className="mt-2 font-display text-base font-semibold">{item.title}</h3>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 -bottom-32 mx-auto h-[420px] w-[820px] aurora opacity-40" />
          <div className="relative mx-auto max-w-6xl px-6 py-28 text-center">
            <Reveal from="scale">
              <h2 className="mx-auto max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                Let's make something worth watching.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
                Video, photos, a website — or all three. Send a brief and I'll come back with a plan and a quote.
              </p>
              <Link
                to="/contact"
                className="mt-10 inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start a project <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
