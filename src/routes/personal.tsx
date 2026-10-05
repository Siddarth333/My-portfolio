import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import resumeAsset from "@/assets/resume.pdf.asset.json";
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Instagram,
  Download,
  ArrowUpRight,
  Cpu,
  Code2,
  GraduationCap,
} from "lucide-react";

export const Route = createFileRoute("/personal")({
  head: () => ({
    meta: [
      { title: "Siddartha Narra — Software & Automation Engineer" },
      {
        name: "description",
        content:
          "Portfolio of Siddartha Narra, an engineer working across industrial automation and full-stack software — Java, Spring Boot, React and Python.",
      },
      { property: "og:title", content: "Siddartha Narra — Software & Automation Engineer" },
      {
        property: "og:description",
        content:
          "Portfolio of Siddartha Narra, an engineer working across industrial automation and full-stack software — Java, Spring Boot, React and Python.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

const skills = [
  { label: "Languages", items: ["Java", "Python", "JavaScript", "SQL", "HTML5", "CSS3"] },
  { label: "Backend", items: ["Spring Boot", "Spring MVC", "Spring Security", "REST APIs"] },
  { label: "Frontend", items: ["React.js", "Bootstrap"] },
  { label: "Database", items: ["MySQL", "PostgreSQL"] },
  { label: "Automation", items: ["Epson RC+", "6-axis Robotics", "Siemens PLC", "Allen-Bradley PLC"] },
];

const projects = [
  {
    title: "ML Price Prediction",
    stack: "Python · scikit-learn",
    body: "Machine learning model predicting house prices from property attributes, covering data preprocessing, feature engineering and model deployment on real estate data.",
  },
  {
    title: "Optimizing Packet Loss in VANETs",
    stack: "Networks · Algorithms",
    body: "Implemented the G-hop protocol for vehicular communication networks using mobility group-based multi-hop broadcast and a Depth First Search traversal.",
  },
  {
    title: "Neuro-Fuzzy Cluster Head Routing",
    stack: "Research · Neuro-Fuzzy",
    body: "Adaptive self-learning hybrid clustering for VANETs, outperforming existing methods on packet delivery ratio, end-to-end delay and cluster formation delay.",
  },
];

const certifications = [
  { org: "Smart Interviews", detail: "Data Structures, Algorithms & Problem Solving" },
  { org: "Coursera · Stanford University", detail: "Machine Learning Specialization" },
  { org: "CONVERGENCE 2K20", detail: "Hackathon — appreciation for participation" },
  { org: "Technotran", detail: "PCB design & fabrication for DC motor speed control" },
  { org: "IEEE MTT-S VNRVJIET SB", detail: "Quiz competition on Rudiments of Antennas" },
  { org: "VNRVJIET", detail: "Volunteer — NSS and Student Force" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">{children}</p>
  );
}

function Portfolio() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section id="top" className="grid-bg border-b border-border pt-20">

        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <SectionLabel>Hyderabad, Telangana · India</SectionLabel>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-6xl">
            Siddartha Narra
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Engineer working across{" "}
            <span className="text-foreground">industrial automation</span> and{" "}
            <span className="text-foreground">software development</span> — translating
            real-world systems into reliable, outcome-driven digital solutions.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href={resumeAsset.url}
              download="Siddartha-Narra-Resume.pdf"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4" /> Download résumé
            </a>
            <a
              href="mailto:narrasiddartha111@gmail.com"
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <Mail className="h-4 w-4" /> Get in touch
            </a>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <SectionLabel>Technical skills</SectionLabel>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {skills.map((group) => (
              <div
                key={group.label}
                className="grid gap-3 py-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-baseline"
              >
                <h3 className="font-mono text-sm text-muted-foreground">{group.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md bg-secondary px-2.5 py-1 text-sm text-secondary-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <SectionLabel>Experience</SectionLabel>
          <div className="mt-8 rounded-lg border border-border bg-card p-6 sm:p-8">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <Cpu className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold">Junior Engineer · Foxconn</h3>
                  <p className="text-sm text-muted-foreground">Hyderabad, India</p>
                </div>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                Aug 2024 — Oct 2025
              </span>
            </div>
            <ul className="mt-6 space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                Programmed and operated a 6-axis Epson industrial robot with Epson RC+, handling
                coordinate systems and precision movement control for automated lines.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                Worked hands-on with Siemens and Allen-Bradley PLC systems across programming,
                system integration and troubleshooting for industrial automation applications.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <SectionLabel>Selected projects</SectionLabel>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {projects.map((p, i) => (
              <article
                key={p.title}
                className={`rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50 ${
                  i === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-xs text-accent">
                  <Code2 className="h-3.5 w-3.5" /> {p.stack}
                </div>
                <h3 className="mt-3 text-xl font-semibold">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Education + Certifications */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <SectionLabel>Education</SectionLabel>
            <div className="mt-8 flex gap-3">
              <GraduationCap className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">
                  B.Tech, Electronics &amp; Communication Engineering
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  VNR Vignana Jyothi Institute of Engineering and Technology, Hyderabad
                </p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  2020 — 2024 · CGPA 8.0 / 10.0
                </p>
              </div>
            </div>
          </div>
          <div>
            <SectionLabel>Certifications &amp; achievements</SectionLabel>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {certifications.map((c) => (
                <li key={c.org} className="py-3">
                  <p className="text-sm font-medium">{c.org}</p>
                  <p className="text-sm text-muted-foreground">{c.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <SectionLabel>Contact</SectionLabel>
          <h2 className="mt-6 max-w-xl text-3xl font-semibold sm:text-4xl">
            Open to software engineering and automation roles.
          </h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {[
              { icon: Mail, label: "narrasiddartha111@gmail.com", href: "mailto:narrasiddartha111@gmail.com" },
              { icon: Phone, label: "+91 95733 10952", href: "tel:+919573310952" },
              {
                icon: Linkedin,
                label: "linkedin.com/in/narra-siddartha",
                href: "https://www.linkedin.com/in/narra-siddartha-28173221b/",
              },
              { icon: Github, label: "github.com/Siddarth333", href: "https://github.com/Siddarth333" },
                { icon: Instagram, label: "instagram.com/siddarth_2520", href: "https://www.instagram.com/siddarth_2520" },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-card px-5 py-4 transition-colors hover:border-primary/50"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate text-sm">{label}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-border">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-8 text-sm text-muted-foreground">
          <p className="flex min-w-0 items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> Hyderabad, Telangana, India
          </p>
          <p className="shrink-0 font-mono text-xs">© {new Date().getFullYear()} Siddartha Narra</p>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

