import { createFileRoute } from "@tanstack/react-router";
import { GalleryPage } from "@/components/gallery-page";

export const Route = createFileRoute("/video")({
  head: () => ({
    meta: [
      { title: "Video Editing — Reels, Films & Edits | Siddartha Narra" },
      {
        name: "description",
        content: "Video edits, reels and short films cut, graded and finished by Siddartha Narra.",
      },
      { property: "og:title", content: "Video Editing — Siddartha Narra" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <GalleryPage
      category="video"
      eyebrow="Chapter 02 — Video editing"
      title="Footage shaped into stories."
      intro="Reels, promos and short films — cut, paced, graded and sound-designed so every second earns its place."
      emptyNote="New edits are rendering. They land here soon."
      requestCategory="video"
    />
  ),
});
