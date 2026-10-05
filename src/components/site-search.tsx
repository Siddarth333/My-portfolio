import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { listMedia } from "@/lib/media.functions";
import { cn } from "@/lib/utils";

type Result = {
  id: string;
  title: string;
  subtitle: string;
  to?: string;
  href?: string;
};

const PAGES: { title: string; subtitle: string; to: string; keywords: string }[] = [
  { title: "Web Dev", subtitle: "Chapter 01 — websites, web apps, requests", to: "/web", keywords: "website web development react landing page app request" },
  { title: "Video editing", subtitle: "Chapter 02 — reels, films, edits, requests", to: "/video", keywords: "video editing reels film montage colour request" },
  { title: "Beyond Code", subtitle: "Chapter 03 — books, songs, travel, certified player", to: "/beyond", keywords: "books notes songs music travel photography games certified player" },
  { title: "About me", subtitle: "Chapter 04 — the engineer behind it", to: "/personal", keywords: "about resume engineer foxconn robotics plc java spring boot skills experience" },
  { title: "Contact", subtitle: "Send a brief, email, phone, socials", to: "/contact", keywords: "contact email phone instagram linkedin github hire quote" },
];

export function SiteSearch({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const fetchMedia = useServerFn(listMedia);

  const { data: media } = useQuery({
    queryKey: ["media", "search-all"],
    queryFn: () => fetchMedia({ data: { limit: 60 } }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const pageHits: Result[] = PAGES.filter((p) =>
      `${p.title} ${p.subtitle} ${p.keywords}`.toLowerCase().includes(term),
    ).map((p) => ({ id: p.to, title: p.title, subtitle: p.subtitle, to: p.to }));

    const routeFor: Record<string, string> = {
      web: "/web",
      video: "/video",
      photo: "/beyond",
      song: "/beyond",
      travel: "/beyond",
      book: "/beyond",
      game: "/beyond",
    };

    const mediaHits: Result[] = (media ?? [])
      .filter((m) =>
        `${m.title} ${m.description ?? ""} ${m.client_name ?? ""} ${m.tags.join(" ")}`.toLowerCase().includes(term),
      )
      .slice(0, 8)
      .map((m) => ({
        id: m.id,
        title: m.title,
        subtitle: m.client_name ?? m.category,
        ...(m.link_url ? { href: m.link_url } : { to: routeFor[m.category] ?? "/" }),
      }));

    return [...pageHits, ...mediaHits];
  }, [q, media]);

  function go(r: Result) {
    setOpen(false);
    setQ("");
    if (r.href) {
      window.open(r.href, "_blank", "noopener");
      return;
    }
    if (r.to) navigate({ to: r.to });
  }

  return (
    <>
      <button
        type="button"
        aria-label="Search the site"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground",
          className,
        )}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden xl:inline">Search</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-background/90 p-4 pt-24 backdrop-blur-xl animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search pages, work, songs, photos…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close search">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {q.trim() === "" && (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  Type to search sections, projects, videos, songs and photos.
                </p>
              )}
              {q.trim() !== "" && results.length === 0 && (
                <p className="px-4 py-6 text-sm text-muted-foreground">No matches for “{q}”.</p>
              )}
              {results.map((r) => (
                <button
                  key={`${r.id}-${r.title}`}
                  type="button"
                  onClick={() => go(r)}
                  className="block w-full border-b border-border/60 px-4 py-3 text-left last:border-0 hover:bg-secondary"
                >
                  <span className="block text-sm font-medium">{r.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{r.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
