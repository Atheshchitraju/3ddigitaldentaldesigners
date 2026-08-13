import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/Section";
import d1 from "@/assets/Ramesh.webp";
import d2 from "@/assets/designer.webp";
import d3 from "@/assets/desginer2.webp";
import d4 from "@/assets/Suman1.webp";
import d5 from "@/assets/Praveen.webp";

export const Route = createFileRoute("/designers")({
  head: () => ({
    meta: [
      { title: "Digital Dental Designers — 3D Digital Dental Designers Lab" },
      {
        name: "description",
        content:
          "Meet the senior 3D dental designers and master ceramists behind every 3D Digital Dental Designers restoration.",
      },
      {
        property: "og:title",
        content: "Digital Dental Designers — 3D Digital Dental Designers Lab",
      },
      {
        property: "og:description",
        content:
          "Meet the senior 3D dental designers and master ceramists behind every 3D Digital Dental Designers restoration.",
      },
    ],
  }),
  component: DesignersPage,
});

const designers = [
  { name: "Althaf Saik", role: "Lead 3D Dental Designer", img: d2 },
  { name: "Abdul Kalam Shaik", role: "Lead 3D Dental Designer", img: d3 },
  { name: "Ramesh", role: "Ceramist", exp: "9 years", img: d1 },
  { name: "Suman ", role: "Master Metalist", exp: "10 years", img: d4 },
  { name: "Praveen", role: "Senior Ceramist", exp: "18 years", img: d5 },
];

function TiltCard({ name, role, exp, img }: (typeof designers)[number]) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        setT({ x: y * -10, y: x * 10 });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      style={{ transform: `perspective(900px) rotateX(${t.x}deg) rotateY(${t.y}deg)` }}
      className="glass rounded-3xl overflow-hidden shadow-soft hover:shadow-glass transition-shadow duration-500"
    >
      <div className="aspect-[4/5] overflow-hidden bg-gradient-silver">
        <img
          src={img}
          alt={name}
          loading="lazy"
          width={768}
          height={896}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">{role}</div>
        <h3 className="mt-2 text-xl font-semibold">{name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{exp} of clinical craft</p>
      </div>
    </motion.div>
  );
}

function DesignersPage() {
  return (
    <PageShell>
      <section className="bg-gradient-hero py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            eyebrow="Our team"
            title="Master craftspeople, digital natives"
            subtitle="Behind every restoration is a senior designer whose hands have shaped thousands of smiles."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designers.map((d) => (
              <TiltCard key={d.name} {...d} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
