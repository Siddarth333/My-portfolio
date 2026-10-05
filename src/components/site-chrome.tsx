import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteSearch } from "@/components/site-search";


const links = [
  { to: "/web", label: "Web Dev" },
  { to: "/video", label: "Video editing" },
  { to: "/beyond", label: "Beyond Code" },
  { to: "/personal", label: "About me" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "border-b border-border bg-background/80 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="font-display text-sm font-semibold tracking-tight" onClick={() => setOpen(false)}>
          <span className="text-primary">▍</span> SIDDARTHA <span className="text-muted-foreground">NARRA</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="story-link transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to={signedIn ? "/admin" : "/auth"}
            className="rounded-full border border-border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors hover:border-primary hover:text-foreground"
          >
            {signedIn ? "Manage" : "Sign in"}
          </Link>
          <SiteSearch />
          <ThemeToggle />
          <ProfileAvatar size={30} />
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <SiteSearch />
          <ThemeToggle className="h-8 w-8" />
          <ProfileAvatar size={28} />
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-border p-2"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

      </div>

      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-6 py-3">
            {[...links, { to: signedIn ? "/admin" : "/auth", label: signedIn ? "Manage" : "Sign in" } as const].map(
              (l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="border-b border-border/60 py-3 text-sm text-muted-foreground last:border-0"
                >
                  {l.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Siddartha Narra — web development, video editing & beyond.</p>
        <div className="flex flex-wrap gap-5">
          <Link to="/web" className="hover:text-foreground">Web Dev</Link>
          <Link to="/video" className="hover:text-foreground">Video</Link>
          <Link to="/beyond" className="hover:text-foreground">Beyond Code</Link>
          <Link to="/personal" className="hover:text-foreground">About</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
