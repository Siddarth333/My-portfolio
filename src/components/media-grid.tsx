import { useState } from "react";
import { Download, ExternalLink, FileText, Music2, Play, Share2, X } from "lucide-react";
import type { PublicMediaItem } from "@/lib/media.functions";
import { Reveal } from "@/components/reveal";
import { toast } from "sonner";

function extFor(item: PublicMediaItem) {
  switch (item.kind) {
    case "video":
      return "mp4";
    case "audio":
      return "mp3";
    case "pdf":
      return "pdf";
    default:
      return "jpg";
  }
}

function fileNameFor(item: PublicMediaItem) {
  return `${item.title.replace(/[^\w-]+/g, "-").toLowerCase()}.${extFor(item)}`;
}

async function downloadItem(item: PublicMediaItem) {
  try {
    const res = await fetch(item.url);
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = fileNameFor(item);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  } catch {
    window.open(item.url, "_blank", "noopener");
  }
}

async function shareItem(item: PublicMediaItem) {
  const url = typeof window === "undefined" ? "" : window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: item.title, url });
      return;
    } catch {
      /* user cancelled */
    }
  }
  await navigator.clipboard.writeText(url);
  toast.success("Link copied to clipboard");
}

function Preview({ item }: { item: PublicMediaItem }) {
  if (item.thumbnail) {
    return (
      <img
        src={item.thumbnail}
        alt={item.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    );
  }

  if (item.kind === "video") {
    return (
      <video
        src={item.url}
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    );
  }

  if (item.kind === "audio") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-secondary">
        <Music2 className="h-10 w-10 text-primary" />
      </div>
    );
  }

  if (item.kind === "pdf") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-secondary">
        <FileText className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <img
      src={item.url}
      alt={item.title}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

export function MediaGrid({ items }: { items: PublicMediaItem[] }) {
  const [active, setActive] = useState<PublicMediaItem | null>(null);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={(i % 3) * 90} from="up">
            <article className="group relative overflow-hidden rounded-xl border border-border bg-card">
              <button
                type="button"
                onClick={() => {
                  if (item.link_url) {
                    window.open(item.link_url, "_blank", "noopener");
                    return;
                  }
                  setActive(item);
                }}
                className="block w-full text-left"
                aria-label={`Open ${item.title}`}
              >
                <div className="relative aspect-video overflow-hidden bg-secondary">
                  <Preview item={item} />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent opacity-80 transition-opacity group-hover:opacity-95" />
                  {item.kind === "video" && (
                    <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur transition-transform duration-500 group-hover:scale-110">
                      <Play className="h-4 w-4 text-primary" />
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  {item.client_name && (
                    <p className="mt-1 font-mono text-xs uppercase tracking-widest text-accent">{item.client_name}</p>
                  )}
                  {item.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </button>
              {item.link_url ? (
                <div className="flex items-center gap-2 border-t border-border px-5 py-3">
                  <a
                    href={item.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Visit website
                  </a>
                </div>
              ) : (
              <div className="flex items-center gap-2 border-t border-border px-5 py-3">
                {item.allow_download && (
                  <button
                    type="button"
                    onClick={() => downloadItem(item)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => shareItem(item)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:border-primary"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
              )}

            </article>
          </Reveal>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-background/95 p-4 backdrop-blur-xl animate-fade-in"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-card animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="truncate font-display text-base font-semibold">{active.title}</h3>
              <button type="button" onClick={() => setActive(null)} aria-label="Close">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="bg-background">
              {active.kind === "audio" ? (
                <div className="flex flex-col items-center gap-6 px-6 py-12">
                  <Music2 className="h-12 w-12 text-primary" />
                  <audio src={active.url} controls autoPlay className="w-full max-w-xl" />
                </div>
              ) : active.kind === "video" ? (
                <video src={active.url} controls autoPlay playsInline className="max-h-[70vh] w-full bg-black" />
              ) : active.kind === "pdf" ? (
                <div className="flex flex-col">
                  <iframe src={active.url} title={active.title} className="h-[70vh] w-full bg-background" />
                  <a
                    href={active.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border-t border-border px-5 py-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open in a new tab
                  </a>
                </div>
              ) : (
                <img src={active.url} alt={active.title} className="max-h-[70vh] w-full object-contain" />
              )}
            </div>
            {active.description && (
              <p className="border-t border-border px-5 py-4 text-sm text-muted-foreground">{active.description}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
