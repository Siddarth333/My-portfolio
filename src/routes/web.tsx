import { createFileRoute } from "@tanstack/react-router";
import { GalleryPage } from "@/components/gallery-page";

export const Route = createFileRoute("/web")({
  head: () => ({
    meta: [
      { title: "Web Development — Sites & Apps | Siddartha Narra" },
      {
        name: "description",
        content: "Landing pages, brand sites and full web applications designed, built and deployed by Siddartha Narra.",
      },
      { property: "og:title", content: "Web Development — Siddartha Narra" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <GalleryPage
      category="web"
      eyebrow="Chapter 01 — Web Dev"
      title="Sites engineered, not just decorated."
      intro="From a single landing page to a full application with logins and dashboards — designed, built and deployed end to end."
      emptyNote="New web projects are being polished. They land here soon."
      requestCategory="web"
    />
  ),
});
