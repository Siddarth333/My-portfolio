import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-chrome";
import { SECTIONS, SectionManager } from "@/components/admin/media-manager";
import { RequestsInbox } from "@/components/admin/requests-inbox";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Studio — Siddartha Narra" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Access = "loading" | "admin" | "denied";

function AdminPage() {
  const navigate = useNavigate();
  const [access, setAccess] = useState<Access>("loading");
  const [tab, setTab] = useState<string>("requests");

  useEffect(() => {
    let active = true;
    async function check() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      if (active) setAccess((roles ?? []).length > 0 ? "admin" : "denied");
    }
    check();
    return () => {
      active = false;
    };
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const section = SECTIONS.find((s) => s.key === tab);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-28">
        {access === "loading" && (
          <div className="flex justify-center py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {access === "denied" && (
          <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-semibold">No studio access</h1>
            <p className="mt-3 text-sm text-muted-foreground">This account isn't an admin, so there's nothing to manage here.</p>
            <div className="mt-6 flex justify-center gap-2">
              <Link to="/" className="rounded-md border border-border px-4 py-2 text-sm">
                Go home
              </Link>
              <button type="button" onClick={signOut} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Sign out
              </button>
            </div>
          </div>
        )}

        {access === "admin" && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Studio</p>
                <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Manage the site</h1>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm transition-colors hover:border-primary"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {[{ key: "requests", label: "Requests" }, ...SECTIONS].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setTab(s.key)}
                  className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                    tab === s.key ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="mt-10">{section ? <SectionManager key={section.key} section={section} /> : <RequestsInbox />}</div>
          </>
        )}
      </main>
    </div>
  );
}
