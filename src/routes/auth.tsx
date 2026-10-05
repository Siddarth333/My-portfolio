import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteHeader } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Owner Sign In — Siddartha Narra" },
      { name: "description", content: "Private sign in for the studio owner to manage video and photo uploads." },
      { property: "og:title", content: "Owner Sign In — Siddartha Narra" },
      { property: "og:description", content: "Private studio access." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      navigate({ to: "/admin", replace: true });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/auth" },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        setNotice("Check your email to confirm the account, then sign in.");
        return;
      }
      navigate({ to: "/admin", replace: true });
    }
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) {
      toast.error("Google sign-in failed.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="relative flex min-h-screen items-center justify-center px-6 pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-[420px] w-[720px] aurora animate-float-slow opacity-40" />
        <Reveal from="scale" className="relative w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-8">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Studio access</p>
            <h1 className="mt-4 text-2xl font-semibold">
              {mode === "signin" ? "Sign in to the studio" : "Create the studio account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Private area for uploading and managing work.
            </p>

            {notice && <p className="mt-4 rounded-md border border-border p-3 text-sm text-muted-foreground">{notice}</p>}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm text-muted-foreground">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted-foreground">Password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <button
              type="button"
              onClick={onGoogle}
              className="mt-3 w-full rounded-md border border-border px-5 py-2.5 text-sm transition-colors hover:bg-secondary"
            >
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-5 w-full text-xs text-muted-foreground hover:text-foreground"
            >
              {mode === "signin" ? "Need to create the account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
