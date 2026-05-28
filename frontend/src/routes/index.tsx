import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Section";

import logo from "@/assets/logo1.webp";
import logo1 from "@/assets/Excel.webp";
import logo2 from "@/assets/girishlogo.webp";
import logo3 from "@/assets/House of teeth.webp";
import logo4 from "@/assets/makers-of-smile.webp";
import logo5 from "@/assets/tooth-align.webp";
import logo6 from "@/assets/chaitana-logo.webp";
import logo7 from "@/assets/ecity-logo.webp";
import logo8 from "@/assets/allaboutteethlogo.webp";
import logo9 from "@/assets/niranjanlogo.webp";
import ChaitanaBanner from "@/assets/chaitana-banner.webp";

import SurgicalGuide from "@/assets/SurgicalGuideDesign1.webp";
import digital3D from "@/assets/3D.webp";
import Implants from "@/assets/Implants.webp";
import FullArch from "@/assets/Full Arch Veneer Restoration.webp";
import Monolithic from "@/assets/Monolithic Zirconia Crown.webp";
import Inlay from "@/assets/Lithium Disilicate Inlay.webp";

import jasbanner from "@/assets/logo.webp";
import girishBanner from "@/assets/girish-banner.webp";
import makersBanner from "@/assets/makers-banner.webp";
import toothAlignBanner from "@/assets/tooth-align-banner.webp";
import houseBanner from "@/assets/house-of-teeth-banner.webp";
import excelBanner from "@/assets/excel-banner.webp";
import chaitanaBanner from "@/assets/chaitana-banner.webp";
import ecityBanner from "@/assets/ecity-banner.webp";
import allaboutbanner from "@/assets/allaboutbanner.webp";
import niranjanBanner from "@/assets/niranjan-banner.webp";

import india from "@/assets/india.webp";
import Dental1 from "@/assets/Dental1.webp";
import logoD from "@/assets/LOGO D.webp";
import Segamax from "@/assets/Seagmax.webp";
import Ivoclar from "@/assets/Ivoclar.webp";
import Nobilcam from "@/assets/Nobilcam.webp";
import upcera from "@/assets/upcera.webp";

export const Route = createFileRoute("/")({
  component: Index,
});

const clients = [
  {
    id: "jas-dental",
    name: "Jas Dental",
    location: "HSR Layout, Bengaluru",
    logo: logo,
    banner: jasbanner,
    description:
      "Advanced cosmetic and restorative dental clinic specializing in smile makeovers, zirconia crowns, dental implants, digital smile design, and precision oral care solutions.",
  },
  {
    id: "excel-dental",
    name: "Excel Dental",
    location: "JP Nagar 7th Phase, Bengaluru",
    logo: logo1,
    banner: excelBanner,
    description:
      "Modern digital dental clinic focused on painless dentistry, root canal treatments, cosmetic dentistry, dental veneers, crowns, bridges, and advanced oral rehabilitation.",
  },
  {
    id: "girish-dental",
    name: "Girish Dental Clinic",
    location: "Wilson Garden, Bangalore",
    logo: logo2,
    banner: girishBanner,
    description:
      "Premium family dental clinic providing orthodontics, invisible aligners, smile correction, dental implants, pediatric dentistry, and complete digital dental solutions.",
  },
  {
    id: "house-of-teeth",
    name: "House of Teeth",
    location: "Singasandra, Bangalore",
    logo: logo3,
    banner: houseBanner,
    description:
      "Luxury cosmetic dental studio delivering aesthetic smile transformations, ceramic veneers, full mouth rehabilitation, implant restorations, and digital dental artistry.",
  },
  {
    id: "makers-of-smile",
    name: "Makers of Smile",
    location: "Akshayanagar, Bengaluru",
    logo: logo4,
    banner: makersBanner,
    description:
      "Specialized smile design clinic offering cosmetic dentistry, teeth whitening, aligners, digital smile analysis, zirconia restorations, and advanced dental aesthetics.",
  },
  {
    id: "tooth-align-clinic",
    name: "Tooth Align Clinic",
    location: "HSR Layout, Bengaluru",
    logo: logo5,
    banner: toothAlignBanner,
    description:
      "Orthodontic and aligner-focused dental clinic providing invisible braces, teeth alignment, bite correction, smile enhancement, and modern digital orthodontic care.",
  },
  {
    id: "dr-chaitana-dental-care",
    name: "Dr Chaitana’s Dental Care",
    location: "Electronic City Phase 1, Bengaluru",
    logo: logo6,
    banner: chaitanaBanner,
    description:
      "Advanced prosthodontic and cosmetic dental clinic specializing in smile designing, aligners, implant planning, veneers, full mouth rehabilitation, and modern digital dental solutions.",
  },
  {
    id: "e-city-dental",
    name: "E City Dental",
    location: "Electronic City Phase 1, Bengaluru",
    logo: logo7,
    banner: ecityBanner,
    description:
      "E City Dental is a premium multi-speciality dental clinic specializing in prosthodontics, smile designing, implant planning, aligners, veneers, full mouth rehabilitation, and advanced digital dentistry workflows.",
  },
  {
    id: "all-about-teeth-dental-clinic",
    name: "All About Teeth Multispecialty Dental Clinic",
    location: "Kadubeesanahalli, Bengaluru",
    logo: logo8,
    banner: allaboutbanner,
    description:
      "Comprehensive dental care with a focus on preventive, restorative, and cosmetic dentistry, utilizing the latest digital technologies for optimal patient outcomes.",
  },
  {
    id: "niranjans-dental",
    name: "Niranjan’s Dental",
    location: "Jubilee Hills, Hyderabad",
    logo: logo9,
    banner: niranjanBanner,
    description:
      "Advanced multi-speciality dental clinic specializing in prosthodontics, implant rehabilitation, smile designing, cosmetic dentistry, aligners, and precision digital dental workflows.",
  },
];

const stats = [
  { v: "15+", l: "Years of Craft" },
  { v: "12K", l: "Restorations Delivered" },
  { v: "320", l: "Partner Clinics" },
  { v: "99.4%", l: "Fit Accuracy" },
];

const cinematicServices = [
  {
    number: "01",
    title: "Zirconia",
    subtitle: "Premium Ceramic Restorations",
    desc: "High-strength zirconia restorations engineered for precision, durability, and lifelike aesthetics.",
    image: Monolithic,
    items: ["Zirconia Classic", "Zirconia Premium", "Multilayered Zirconia", "Monolithic Zirconia"],
  },

  {
    number: "02",
    title: "Implant Prosthetics",
    subtitle: "Advanced Implant Restorations",
    desc: "Precision-engineered implant restorations for long-term clinical success.",
    image: Implants,
    items: [
      "Cement Retained Crowns",
      "Screw Retained Crowns",
      "DMLS Crown & Bridge",
      "Hybrid Implant Solutions",
    ],
  },

  {
    number: "03",
    title: "DMLS CAD/CAM",
    subtitle: "Metal Precision Engineering",
    desc: "Direct Metal Laser Sintered restorations built with exceptional precision.",
    image: SurgicalGuide,
    items: ["DMLS Crown & Bridge", "SLM Crown", "Full Metal Restorations", "Inlay / Onlay"],
  },

  {
    number: "04",
    title: "Smile Design",
    subtitle: "Digital Aesthetic Planning",
    desc: "Advanced digital smile designing workflows with artistic precision.",
    image: FullArch,
    items: [
      "Smile Analysis",
      "Digital Smile Planning",
      "Ceramic Veneers",
      "Facial Aesthetic Workflow",
    ],
  },

  {
    number: "05",
    title: "E-Max CAD",
    subtitle: "Natural Aesthetic Ceramics",
    desc: "Lithium disilicate restorations designed for premium aesthetics.",
    image: Inlay,
    items: ["E-Max CAD", "E-Max Veneers", "E-Max Inlay/Onlay", "E-Max Prime"],
  },

  {
    number: "06",
    title: "Orthodontic Appliances",
    subtitle: "Digital Orthodontic Solutions",
    desc: "Custom-designed orthodontic appliances manufactured digitally.",
    image: logoD,
    items: ["Clear Aligners", "Night Guards", "Orthodontic Retainers", "Bleaching Trays"],
  },
];

function Index() {
  const [active, setActive] = useState(0);

  const nextSlide = () => {
    setActive((prev) => (prev + 1) % clients.length);
  };

  const prevSlide = () => {
    setActive((prev) => (prev === 0 ? clients.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <PageShell>
      {/* PREMIUM CARD SLIDER */}
      <section className="relative overflow-hidden bg-[#f5f7fb] pt-10 pb-12">
        {/* BACKGROUND GLOW */}
        <div className="absolute top-0 left-0 h-72 w-72 bg-primary/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 h-72 w-72 bg-accent/10 blur-3xl rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          {/* TOP HEADER */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">
                Most Trusted
              </p>

              <h2 className="mt-3 text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                Elite Dental Clinics
              </h2>
            </div>

            {/* NAVIGATION */}
            <div className="flex gap-3">
              <button
                onClick={prevSlide}
                className="h-12 w-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center transition hover:scale-105"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                onClick={nextSlide}
                className="h-12 w-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center transition hover:scale-105"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* MOBILE VIEW */}
          <div className="block lg:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={clients[active].id}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.6 }}
                className="rounded-[2rem] overflow-hidden bg-white shadow-2xl"
              >
                {/* IMAGE */}
                <div className="relative h-[260px] overflow-hidden">
                  <img
                    src={clients[active].banner}
                    alt={clients[active].name}
                    className={`h-full w-full ${
                      clients[active].id === "jas-dental"
                        ? "object-contain bg-white"
                        : "object-cover"
                    }`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* LOGO */}
                  <div className="absolute top-5 left-5 bg-white rounded-2xl shadow-xl h-16 w-16 overflow-hidden">
                    <img
                      src={clients[active].logo}
                      alt={clients[active].name}
                      className={`h-full w-full ${
                        clients[active].id === "girish-dental"
                          ? "object-contain scale-125"
                          : clients[active].id === "excel-dental"
                            ? "object-contain scale-150"
                            : "object-cover"
                      }`}
                    />
                  </div>

                  {/* TITLE */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white">{clients[active].name}</h3>

                    <p className="mt-2 text-white/80 text-sm">Premium Digital Dentistry</p>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {clients[active].description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <h3 className="text-2xl font-bold text-gray-800">{clients[active].name}</h3>

                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-black text-xs font-semibold border border-white/20">
                      📍 {clients[active].location}
                    </span>
                  </div>

                  <div className="mt-6">
                    <Link
                      to={`/clinics/${clients[active].id}`}
                      preload="intent"
                      className="w-full inline-flex items-center justify-center rounded-full bg-gradient-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
                    >
                      Explore Clinic
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden lg:grid grid-cols-12 gap-16 items-center mt-6">
            {/* FEATURED CARD */}
            <motion.div
              key={clients[active].id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="col-span-7 ml-2"
            >
              <div className="relative h-[560px] overflow-hidden rounded-[2.7rem] shadow-[0_25px_80px_rgba(0,0,0,0.18)]">
                {/* IMAGE */}
                <img
                  src={clients[active].banner}
                  alt={clients[active].name}
                  className={`h-full w-full ${
                    clients[active].id === "jas-dental" ? "object-contain bg-white" : "object-cover"
                  }`}
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* LOGO */}
                <div className="absolute top-8 left-8 bg-white rounded-3xl shadow-2xl h-24 w-24 overflow-hidden">
                  <img
                    src={clients[active].logo}
                    alt={clients[active].name}
                    className={`h-full w-full ${
                      clients[active].id === "girish-dental"
                        ? "object-contain scale-125"
                        : clients[active].id === "excel-dental"
                          ? "object-contain scale-150"
                          : "object-cover"
                    }`}
                  />
                </div>

                {/* CONTENT */}
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-white/70 uppercase tracking-[0.28em] text-sm">
                    Featured Clinic
                  </p>

                  <div className="mt-3 flex items-center gap-4 flex-wrap">
                    <h3 className="text-5xl font-bold text-white leading-[1.05]">
                      {clients[active].name}
                    </h3>

                    <span className="px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-semibold border border-white/20">
                      📍 {clients[active].location}
                    </span>
                  </div>

                  <p className="mt-4 max-w-2xl text-white/80 text-lg leading-relaxed">
                    {clients[active].description}
                  </p>

                  <div className="mt-6">
                    <Link
                      to={`/clinics/${clients[active].id}`}
                      preload="intent"
                      className="inline-flex items-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-xl"
                    >
                      Explore Clinic →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT SIDE STACK */}
            {/* RIGHT SIDE LOGO PANEL */}
            <div className="col-span-5 flex items-center justify-end pr-4">
              <motion.div
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-[520px]"
              >
                {/* GLOW */}
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-[4rem] scale-110" />

                {/* IMAGE CONTAINER */}
                <div className="relative overflow-hidden rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.22)]">
                  <img
                    src={digital3D}
                    alt="3D Digital Dental Designers"
                    className="w-full h-[520px] object-cover hover:scale-105 transition duration-1000"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* PAGINATION */}
          <div className="mt-8 flex justify-center gap-3">
            {clients.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`transition-all duration-300 rounded-full ${
                  active === i ? "w-10 h-3 bg-primary" : "w-3 h-3 bg-primary/30 hover:bg-primary/60"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SMOOTH TRANSITION */}
      <div className="h-20 bg-gradient-to-b from-[#f5f7fb] to-transparent" />

      {/* WHO WE ARE SECTION */}
      <section className="w-full bg-white py-14 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
            {/* LEFT SIDE DESIGN */}
            <div className="flex justify-center">
              <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-[320px] sm:max-w-[420px] lg:max-w-none">
                {/* TOP LEFT SHAPE */}
                <div className=" rounded-tl-[70px] rounded-br-[70px] md:rounded-tl-[120px] md:rounded-br-[120px] aspect-square overflow-hidden relative">
                  <img
                    src={Segamax}
                    alt="Segamax Dental Solutions"
                    className="w-full h-full object-cover hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:22px_22px]" />
                </div>

                {/* TOP RIGHT IMAGE */}
                <div className="rounded-tl-[70px] rounded-br-[70px] md:rounded-tl-[120px] md:rounded-br-[120px] overflow-hidden aspect-[0.8/1] shadow-2xl">
                  <img
                    src={Nobilcam}
                    alt="Digital Dental Designers Lab"
                    className="w-full h-full object-cover hover:scale-105 transition duration-700"
                  />
                </div>

                {/* BOTTOM LEFT IMAGE */}
                <div className="rounded-tl-[70px] rounded-br-[70px] md:rounded-tl-[120px] md:rounded-br-[120px] overflow-hidden aspect-[0.8/1] shadow-2xl -mt-4 md:-mt-10">
                  <img
                    src={upcera}
                    alt="3D Dental Design"
                    className="w-full h-full object-cover hover:scale-105 transition duration-700"
                  />
                </div>

                {/* BOTTOM RIGHT SHAPE */}
                <div className=" rounded-tl-[70px] rounded-br-[70px] md:rounded-tl-[120px] md:rounded-br-[120px] aspect-square overflow-hidden mt-4 md:mt-10 relative">
                  <img
                    src={Ivoclar}
                    alt="Ivoclar Vivadent"
                    className="w-full h-max object-cover hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:22px_22px]" />
                </div>
              </div>
            </div>

            {/* RIGHT SIDE CONTENT */}
            <div className="text-center lg:text-left">
              <p className="text-blue-600 font-semibold tracking-[3px] uppercase mb-3 text-sm md:text-base">
                About Us
              </p>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-blue-500">Who</span>{" "}
                <span className="text-black">We Are</span>
              </h2>

              <p className="text-gray-600 text-left md:text-lg leading-8 md:leading-9 mb-5">
                Digital Dental Designers Lab is a modern dental design and restoration partner
                focused on precision, innovation, and aesthetic excellence. We specialize in
                advanced digital dental workflows that help clinics and dental professionals deliver
                accurate and natural-looking restorations.
              </p>

              <p className="text-gray-600 text-left md:text-lg leading-8 md:leading-9 mb-5">
                Using cutting-edge CAD/CAM technology, 3D design systems, and skilled craftsmanship,
                we create high-quality crowns, bridges, implants, veneers, and custom smile
                solutions with exceptional accuracy and consistency.
              </p>

              <p className="text-gray-600 text-left md:text-lg leading-8 md:leading-9">
                Our mission is to combine digital innovation with artistic detailing to support
                dentists with faster turnaround times, reliable communication, and uncompromising
                quality.
              </p>

              {/* OPTIONAL STATS */}
              {/* 
        <div className="grid grid-cols-3 gap-4 md:gap-6 pt-10">

          <div>
            <h3 className="text-2xl md:text-4xl font-bold text-blue-600">
              10+
            </h3>

            <p className="text-gray-600 text-xs md:text-base mt-2">
              Years Experience
            </p>
          </div>

          <div>
            <h3 className="text-2xl md:text-4xl font-bold text-blue-600">
              500+
            </h3>

            <p className="text-gray-600 text-xs md:text-base mt-2">
              Happy Clinics
            </p>
          </div>

          <div>
            <h3 className="text-2xl md:text-4xl font-bold text-blue-600">
              1000+
            </h3>

            <p className="text-gray-600 text-xs md:text-base mt-2">
              Cases Delivered
            </p>
          </div>
        </div> 
        */}
            </div>
          </div>
        </div>
      </section>

      {/* FULL WIDTH VIDEO SECTION */}
      <section className="relative w-screen left-1/2 -translate-x-1/2 bg-black overflow-hidden">
        {/* 16:9 CONTAINER */}
        <div className=" w-full h-full aspect-video">
          {/* VIDEO */}
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-contain scale-220 opacity-90"
          >
            <source src="/banner-video1.mp4" type="video/mp4" />
          </video>

          {/* OPTIONAL OVERLAY */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>
      </section>
      <br />
      {/* CINEMATIC SERVICES */}
      <section className="w-full bg-[#f7f7f5] py-16 md:py-24 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-20">
          {/* TOP HEADING */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
            viewport={{ once: true }}
            className="mb-20 md:mb-28"
          >
            <p className="text-blue-500 uppercase tracking-[4px] font-semibold text-sm mb-6">
              Our Expertise
            </p>

            <h2 className="text-4xl md:text-7xl font-bold leading-[1.05] text-black max-w-6xl">
              Complete Digital Dental Laboratory Solutions
            </h2>
          </motion.div>

          {cinematicServices.map((service, i) => (
            <div
              key={service.title}
              className={`grid lg:grid-cols-12 gap-10 lg:gap-12 items-center ${
                i !== cinematicServices.length - 1 ? "mb-20 md:mb-24" : ""
              }`}
            >
              {/* IMAGE */}
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: 120,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                viewport={{
                  once: true,
                  amount: 0.25,
                }}
                className={`lg:col-span-7 relative ${i % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <div className="overflow-hidden rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-[260px] sm:h-[420px] lg:h-[520px] object-cover hover:scale-105 duration-1000"
                  />
                </div>
              </motion.div>

              {/* CONTENT */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: i % 2 === 0 ? 80 : -80,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                }}
                transition={{
                  duration: 1,
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                viewport={{
                  once: true,
                  amount: 0.3,
                }}
                className={`lg:col-span-5 relative z-10 ${i % 2 === 1 ? "lg:order-1" : ""}`}
              >
                {/* SUBTITLE */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.2,
                  }}
                  viewport={{ once: true }}
                  className="text-gray-400 uppercase tracking-[4px] text-sm mb-5"
                >
                  {service.subtitle}
                </motion.p>

                {/* TITLE */}
                <motion.h3
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
                  }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-6xl font-bold leading-[1.1] text-black mb-8"
                >
                  {service.title}
                </motion.h3>

                {/* DESCRIPTION */}
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.45,
                  }}
                  viewport={{ once: true }}
                  className="text-gray-600 text-base md:text-lg leading-8 md:leading-10 max-w-xl mb-10"
                >
                  {service.desc}
                </motion.p>

                {/* SERVICES ITEMS */}
                <div className="space-y-5">
                  {service.items.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{
                        opacity: 0,
                        y: 40,
                        scale: 0.96,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 0.7,
                        delay: index * 0.12,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      viewport={{
                        once: true,
                        amount: 0.2,
                      }}
                      className="flex items-start gap-4 border-b border-gray-200 pb-5"
                    >
                      {/* GLOW DOT */}
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{
                          delay: index * 0.12 + 0.15,
                          duration: 0.4,
                        }}
                        viewport={{ once: true }}
                        className="mt-2 h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.7)] shrink-0"
                      />

                      {/* TEXT */}
                      <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.12 + 0.2,
                          duration: 0.5,
                        }}
                        viewport={{ once: true }}
                        className="text-gray-800 text-base md:text-lg leading-relaxed"
                      >
                        {item}
                      </motion.p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      <br />
      {/* GLOBAL PRESENCE */}
      <section className="w-full bg-[#f8f8f8] py-20 md:py-28 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-20">
          {/* HEADING */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-7xl font-bold">
              <span className="text-black">Global</span>{" "}
              <span className="text-blue-500">Presence</span>
            </h2>

            <p className="text-gray-500 text-lg mt-5">Redefining Dentistry Globally</p>
          </motion.div>

          {/* CONTENT */}
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* LEFT MAP */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              }}
              viewport={{ once: true }}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-full overflow-hidden rounded-[2rem] bg-white shadow-[0_15px_50px_rgba(0,0,0,0.08)] p-6 md:p-10">
                {/* INDIA MAP */}
                <img
                  src={india}
                  alt="India Presence"
                  className="w-full object-contain scale-[1.08] opacity-95"
                />

                {/* BANGALORE */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3,
                  }}
                  viewport={{ once: true }}
                  className="absolute top-[70%] left-[33%]"
                >
                  {/* PING */}
                  <div className="absolute inset-0 h-8 w-8 rounded-full bg-blue-400 animate-ping opacity-40" />

                  {/* DOT */}
                  <div className="relative h-8 w-8 rounded-full bg-blue-600 border-4 border-white shadow-[0_0_30px_rgba(59,130,246,0.5)]" />

                  {/* LABEL */}
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap shadow-lg">
                    Bangalore
                  </div>
                </motion.div>

                {/* HYDERABAD */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.5,
                  }}
                  viewport={{ once: true }}
                  className="absolute top-[59%] left-[38%]"
                >
                  {/* PING */}
                  <div className="absolute inset-0 h-6 w-6 rounded-full bg-purple-400 animate-ping opacity-40" />

                  {/* DOT */}
                  <div className="relative h-6 w-6 rounded-full bg-purple-600 border-4 border-white shadow-[0_0_25px_rgba(147,51,234,0.5)]" />

                  {/* LABEL */}
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-lg">
                    Hyderabad
                  </div>
                </motion.div>

                {/* CHENNAI */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.7,
                  }}
                  viewport={{ once: true }}
                  className="absolute top-[76%] left-[38%]"
                >
                  {/* PING */}
                  <div className="absolute inset-0 h-6 w-6 rounded-full bg-red-400 animate-ping opacity-40" />

                  {/* DOT */}
                  <div className="relative h-6 w-6 rounded-full bg-red-500 border-4 border-white shadow-[0_0_25px_rgba(239,68,68,0.5)]" />

                  {/* LABEL */}
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-lg">
                    Chennai
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* RIGHT SIDE */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              }}
              viewport={{ once: true }}
              className="bg-white border border-blue-100 rounded-[1.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.05)]"
            >
              {/* TOP TABS */}
              <div className="flex overflow-x-auto bg-[#edf3ff] border-b border-blue-100">
                {/* <button className="px-8 py-5 text-blue-400 font-semibold whitespace-nowrap">
                  UAE
                </button> */}

                {/* <button className="px-8 py-5 text-blue-400 font-semibold whitespace-nowrap">
                  India
                </button> */}

                <button className="px-10 py-5 bg-[#4567d8] text-white font-semibold rounded-full m-2 whitespace-nowrap">
                  Bangalore
                </button>

                {/* <button className="px-8 py-5 text-blue-400 font-semibold whitespace-nowrap">
                  Canada
                </button> */}

                {/* <button className="px-8 py-5 text-blue-400 font-semibold whitespace-nowrap">
                  Australia
                </button> */}
              </div>

              {/* CONTENT */}
              <div className="p-8 md:p-12">
                <h3 className="text-3xl font-bold text-black mb-6">Digital Dental Designers</h3>

                <div className="space-y-8">
                  {/* ADDRESS */}
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-full bg-[#4567d8] flex items-center justify-center text-white text-xl shrink-0">
                      📍
                    </div>

                    <div>
                      <p className="text-xl font-semibold text-black mb-2">Bangalore, India</p>

                      <p className="text-gray-600 text-lg leading-8">
                        NO 107, First Floor,4th Cross,36th Main Road, BHOOHBCL, KAS Officers Colony,
                        BTM Layout 2nd Stage, Bengaluru, Karnataka 560068
                      </p>
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-full bg-[#4567d8] flex items-center justify-center text-white text-xl shrink-0">
                      ✉️
                    </div>

                    <div>
                      <p className="text-xl font-semibold text-black mb-2">Email Address</p>

                      <p className="text-gray-600 text-lg leading-8">
                        dentaldesigners.3d@gmail.com
                      </p>
                    </div>
                  </div>

                  {/* PHONE */}
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-full bg-[#4567d8] flex items-center justify-center text-white text-xl shrink-0">
                      📞
                    </div>

                    <div>
                      <p className="text-xl font-semibold text-black mb-2">Contact Number</p>

                      <p className="text-gray-600 text-lg leading-8">+91 8217216397</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="bg-[#4567d8] text-white text-right px-6 py-4 text-lg font-semibold">
                1/1
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HERO */}
    </PageShell>
  );
}
