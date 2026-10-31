import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import vijayaLakshmiImage from "@/assets/events/Dr. Vijaya Lakshmi_ Dental Expert.png";
import rizwanaImage from "@/assets/events/Meet Our Dental Expert.png";
import aiDentistryImage from "@/assets/events/Ai_Dentistry.png";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronDown,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  Star,
  Users,
  Gift,
  Target,
  Lightbulb,
  BookmarkCheck,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/events/the-dentist-as-a-brand")({
  component: DentistAsBrandPage,
});

const UPI_ID = "7204392493-2@ybl";
const UPI_LINK =
  "upi://pay?pa=7204392493-2@ybl&pn=Digital%20Dental%20Designers&am=750&cu=INR&tn=The%20Dentist%20as%20a%20Brand";
const GLOBAL_NAV_OFFSET = 72;

const FAQS = [
  {
    q: "Who should attend this seminar?",
    a: "Dental students, interns, practising dentists, clinic owners, and dental professionals who want to build their digital presence.",
  },
  {
    q: "Do I need prior social media knowledge?",
    a: "No! Whether you're just starting out or already posting content, you'll learn strategic ways to strengthen your digital identity.",
  },
  {
    q: "Will this help me grow my dental practice?",
    a: "You'll learn how personal branding, educational content, and digital visibility can help build patient awareness and trust.",
  },
  {
    q: "Is this just another Instagram marketing workshop?",
    a: "No. The focus is on strategic personal branding, digital positioning, content frameworks, and responsible online communication—not just posting reels.",
  },
  {
    q: "Will we learn about professional advertising guidelines?",
    a: "Yes, the seminar will address ethical and responsible digital communication for dental professionals, including relevant professional guidelines.",
  },
  {
    q: "Do I need to be comfortable appearing on camera?",
    a: "Not necessarily. You'll explore ways to communicate your professional value and create content that suits your style.",
  },
  {
    q: "Who are the speakers?",
    a: "🎤 Dr. M. Vijaya Lakshmi Macherla — Dental Surgeon, Implantologist, and Smile Design Specialist, featured in Forbes India 2026.\n🎤 Dr. Rizwana Tarannum — B.D.S., Certified Cosmetic Dentist, and Digital Marketing Head.",
  },
  {
    q: "When and where is the event?",
    a: "📅 15 November 2026\n📍 Bengaluru\n🎟️ Registration fee: ₹750",
  },
  {
    q: "How do I register?",
    a: "Scan the QR code on the event poster and complete your registration to reserve your spot.",
  },
  {
    q: "Why should I attend?",
    a: "Because clinical excellence deserves clear communication. Learn how to build a recognisable professional identity and approach your digital growth strategically.",
  },
];

function DentistAsBrandPage() {
  const [registered, setRegistered] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(true);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("registered") === "true") {
      setRegistered(true);
      document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);
  useEffect(() => {
    const el = document.getElementById("registration");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main
      className="min-h-screen bg-[#fffaf5] text-[#2b160a] antialiased"
      style={{ paddingTop: GLOBAL_NAV_OFFSET }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,700..900,0..100&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <header
        className="sticky z-40 border-b border-[#f0dfc9] bg-[#fffaf5]/80 backdrop-blur-xl"
        style={{ top: GLOBAL_NAV_OFFSET }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 font-body">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-[#3d2314]">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <span className="hidden md:flex items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] text-[#8b5a3c]">
            <Star size={12} className="text-[#e5a044] fill-[#e5a044]" /> DIGITAL DENTAL DESIGNERS
          </span>
          <a
            href="#registration"
            className="inline-flex items-center gap-2 rounded-full bg-[#1a0a2e] px-5 py-2.5 text-sm font-bold text-white shadow-lg"
          >
            Register · ₹750
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#16091f] px-4 py-14 sm:px-6 md:py-20 font-body">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#f7c873]/30 to-[#8b5cf6]/20 blur-[80px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f7c873]/30 bg-[#f7c873]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f7c873]">
                <Sparkles size={14} /> Digital Dental Designers Presents
              </div>
              <h1 className="font-display mt-5 text-[42px] font-[900] leading-[0.9] text-white sm:text-[64px] lg:text-[74px]">
                The Dentist
                <span className="block bg-gradient-to-r from-[#f7c873] to-[#e5a044] bg-clip-text text-transparent">
                  As a Brand
                </span>
              </h1>
              <p className="font-display mt-4 text-xl font-semibold italic text-[#f7d9a0] sm:text-2xl">
                From Invisible Expertise to Remarkable Identity
              </p>
              <p className="mt-5 text-[16px] font-bold text-white">
                A 3-Hour Digital Branding & Content Masterclass for Dentists
              </p>
              <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5">
                <span className="text-2xl font-extrabold text-white">₹750</span>
                <span className="text-sm text-white/50 line-through">₹1200</span>
                <span className="rounded-full bg-[#f7c873] px-3 py-1 text-xs font-extrabold text-[#1a0a2e]">
                  Early Bird
                </span>
              </div>

              <div className="mt-7 space-y-4 text-[15px] leading-7 text-white/80">
                <p className="text-white/90 font-medium">
                  Your clinical expertise matters. Does your digital presence communicate what makes
                  you different?
                </p>
                <p>
                  In a crowded digital world, posting more is not the same as building a memorable
                  brand. Explore how dentists can move beyond generic social media content and
                  develop a distinctive, credible, and patient-centred digital identity.
                </p>
                <p className="rounded-2xl border border-[#f7c873]/20 bg-white/[0.06] p-4 text-white">
                  Join this <b className="text-[#f7c873]">STRATEGIC MASTERCLASS</b> in dental
                  branding, marketing psychology, and content differentiation. This is not just
                  another seminar with content ideas.
                </p>
                <div className="pt-2">
                  <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-[#f7c873]">
                    WHAT MAKES THIS MASTERCLASS DIFFERENT?
                  </h3>
                  <p className="mt-2 text-white/70">
                    This is not a basic guide to posting reels. It is a strategic session about how
                    branding, patient psychology, and content can work together to help dental
                    professionals become easier to recognise, understand, and remember.
                  </p>
                </div>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[480px] lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.05] p-2.5 shadow-2xl">
                <img
                  src={aiDentistryImage}
                  alt="AI Dentistry"
                  className="w-full rounded-[24px] bg-white object-contain"
                />
              </div>
              <div className="mt-4 rounded-[24px] border border-[#f7c873]/20 bg-gradient-to-br from-[#2a1440]/80 to-[#1a0a2e]/80 p-6 backdrop-blur">
                <h3 className="font-display flex items-center gap-2 text-[18px] font-extrabold text-white">
                  🧠 AI IN MODERN DENTISTRY
                </h3>
                <p className="mt-3 text-[14px] leading-6 text-white/70">
                  Explore AI-powered clinical tools, smarter workflows and visual patient
                  communication to support better understanding and informed treatment decisions.
                </p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f7c873]">
                  From Clinical Intelligence to Digital Practice Growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSIDE 3-HOUR EXPERIENCE */}
      <section className="bg-[#fdf2e2] px-4 py-14 sm:px-6 md:py-20 font-body">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#a05a18]">
              Inside The Experience
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold text-[#1a0a2e] md:text-[42px]">
              INSIDE THE 3-HOUR EXPERIENCE
            </h2>
            <p className="mt-4 text-[#6b5140]">
              Walk away with five frameworks in one session and learn how to:
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="rounded-[24px] bg-white border border-[#f0dfc9] p-7 shadow-sm hover:-translate-y-1 transition">
              <p className="text-xs font-bold tracking-widest text-[#e5a044]">01</p>
              <h3 className="font-display mt-2 text-xl font-bold">Become Remarkable</h3>
              <p className="mt-2 text-sm leading-6 text-[#6b5a4a]">
                Become remarkable rather than interchangeable.
              </p>
            </div>
            <div className="rounded-[24px] bg-white border border-[#f0dfc9] p-7 shadow-sm hover:-translate-y-1 transition">
              <p className="text-xs font-bold tracking-widest text-[#e5a044]">02</p>
              <h3 className="font-display mt-2 text-xl font-bold">Understand Patients</h3>
              <p className="mt-2 text-sm leading-6 text-[#6b5a4a]">
                Understand what patients really need.
              </p>
            </div>
            <div className="rounded-[24px] bg-white border border-[#f0dfc9] p-7 shadow-sm hover:-translate-y-1 transition">
              <p className="text-xs font-bold tracking-widest text-[#e5a044]">03</p>
              <h3 className="font-display mt-2 text-xl font-bold">Become Recognisable</h3>
              <p className="mt-2 text-sm leading-6 text-[#6b5a4a]">
                Become recognisable and easier to recall.
              </p>
            </div>
          </div>
          <div className="mt-6 max-w-5xl mx-auto rounded-[24px] bg-gradient-to-br from-[#1a0a2e] to-[#3d1853] p-7 text-white flex gap-4 items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7c873] text-[#1a0a2e]">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-[#f7c873]">
                04 — AI IN MODERN DENTISTRY
              </p>
              <h3 className="font-display mt-1 text-xl font-bold">
                From Clinical Intelligence to Digital Practice Growth
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Explore AI-powered clinical tools, smarter workflows and visual patient
                communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MEET EXPERTS - FIXED: BIG LIKE BEFORE, FORBES ONLY FOR VIJAYA MAM */}
      <section className="bg-[#1a0a2e] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.25em] text-[#f7c873]">
              Meet Our Dental Experts
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold text-white md:text-[42px]">
              Learn From Experienced Professionals
            </h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-8 md:grid-cols-2">
            {/* Vijaya Mam - On Top with Forbes Badge */}
            <div className="overflow-hidden rounded-[28px] border border-[#f7c873]/30 bg-white shadow-2xl">
              <img
                src={vijayaLakshmiImage}
                alt="Dr. M. Vijaya Lakshmi Macherla"
                className="h-auto w-full object-contain"
                loading="lazy"
              />
              <div className="border-t border-[#f0dfc9] bg-white p-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#1a0a2e] px-4 py-1.5 text-[11px] font-bold text-[#f7c873]">
                  <Star size={12} className="fill-[#f7c873]" /> Featured in Forbes India 2026
                </div>
                <h3 className="font-display mt-4 text-[22px] font-bold leading-tight text-[#1a0a2e]">
                  Dr. M. Vijaya Lakshmi Macherla
                </h3>
                <p className="mt-2 text-[14px] leading-6 text-[#6b5140]">
                  Dental Surgeon, Implantologist, and Smile Design Specialist
                </p>
              </div>
            </div>
            {/* Rizwana Mam - Below on mobile */}
            <div className="overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-2xl">
              <img
                src={rizwanaImage}
                alt="Dr. Rizwana Tarannum"
                className="h-auto w-full object-contain"
                loading="lazy"
              />
              <div className="border-t border-[#f0dfc9] bg-white p-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fdf2e2] px-4 py-1.5 text-[11px] font-bold text-[#a05a18]">
                  Digital Marketing Head
                </div>
                <h3 className="font-display mt-4 text-[22px] font-bold leading-tight text-[#1a0a2e]">
                  Dr. Rizwana Tarannum
                </h3>
                <p className="mt-2 text-[14px] leading-6 text-[#6b5140]">
                  B.D.S., Certified Cosmetic Dentist
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO SHOULD ATTEND - FIXED: NO SMALL IMAGES, NO MISLEADING LINE */}
      <section className="bg-white px-4 py-14 sm:px-6 md:py-20 font-body border-y border-[#f0dfc9]">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fdf2e2] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#a05a18]">
              <Users size={14} /> Who Is This For?
            </div>
            <h2 className="font-display mt-4 text-3xl font-extrabold leading-tight text-[#1a0a2e] md:text-[44px]">
              WHO SHOULD ATTEND?
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[#6b5140]">
              Dentists and clinic owners who want to:
            </p>
          </div>
          <div className="mx-auto mt-8 grid max-w-3xl gap-3">
            {[
              "Sharpen their professional positioning as a strong personal Brand",
              "Make their content more distinctive in the era of new guidelines",
              "Communicate their expertise more clearly",
              "Build a recognisable and intentional digital presence",
              "Move beyond generic social media strategies",
            ].map((item, i) => (
              <li
                key={i}
                className="flex list-none gap-3 rounded-2xl border border-[#f8e9d9] bg-[#fffaf5] p-5 text-[15px] font-medium leading-6"
              >
                <CheckCircle2 className="shrink-0 text-[#e5a044]" size={22} /> {item}
              </li>
            ))}
          </div>
        </div>
      </section>

      {/* ATTENDEE TAKEAWAY */}
      <section className="bg-[#1a0a2e] px-4 py-14 sm:px-6 md:py-20 font-body relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(247,200,115,0.12),transparent_70%)]" />
        <div className="relative mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f7c873]/30 bg-[#f7c873]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f7c873]">
              <Gift size={14} /> Exclusive Takeaway
            </div>
            <h2 className="font-display mt-4 text-3xl font-extrabold md:text-[44px] leading-tight">
              ATTENDEE TAKEAWAY: <span className="text-[#f7c873]">DENTAL BRAND BLUEPRINT</span>
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-white/70">
              A practical worksheet to help you define your audience, positioning, distinctive
              perspective, signature content series, recognition cues, and measures of progress and
              much more
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <Target size={20} />,
                title: "Audience & Positioning",
                desc: "Define who you serve and how you stand out",
              },
              {
                icon: <Lightbulb size={20} />,
                title: "Distinctive Perspective",
                desc: "Your signature point of view & content pillars",
              },
              {
                icon: <BookmarkCheck size={20} />,
                title: "Recognition & Growth",
                desc: "Recognition cues, content series & progress metrics",
              },
            ].map((c, i) => (
              <div
                key={i}
                className="rounded-[20px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur hover:bg-white/[0.08] transition"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7c873] text-[#1a0a2e]">
                  {c.icon}
                </div>
                <h3 className="font-display mt-4 text-lg font-bold text-white">{c.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* READY TO BUILD CTA */}
      <section className="bg-[#fffaf5] px-4 py-14 sm:px-6 md:py-20 font-body">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-gradient-to-br from-[#f7c873] via-[#f3b04a] to-[#e5a044] p-[1.5px] shadow-2xl">
          <div className="rounded-[30px] bg-white px-6 py-10 sm:px-10 sm:py-14 text-center">
            <h2 className="font-display text-3xl font-[900] leading-[0.95] text-[#1a0a2e] sm:text-[42px]">
              READY TO BUILD A MORE MEMORABLE
              <br />
              DIGITAL PRESENCE?
            </h2>
            <p className="font-display mt-3 text-xl font-bold italic text-[#8b5a3c]">
              THE DENTIST AS A BRAND — From Invisible Expertise to Remarkable Identity
            </p>
            <div className="mt-8 mx-auto grid max-w-3xl gap-3 sm:grid-cols-3 text-left">
              <div className="rounded-2xl border border-[#f0dfc9] bg-[#fffaf5] p-4">
                <p className="text-xs font-bold uppercase text-[#a05a18]">📅 Date</p>
                <p className="mt-1 font-bold">15 Nov 2026 (Sunday)</p>
              </div>
              <div className="rounded-2xl border border-[#f0dfc9] bg-[#fffaf5] p-4">
                <p className="text-xs font-bold uppercase text-[#a05a18]">📍 Location</p>
                <p className="mt-1 font-bold">Bengaluru</p>
                <p className="text-xs text-[#8a7665]">10 am – 1 pm</p>
              </div>
              <div className="rounded-2xl border border-[#1a0a2e] bg-[#1a0a2e] p-4 text-white">
                <p className="text-xs font-bold uppercase text-[#f7c873]">🎟️ Fee</p>
                <p className="mt-1 font-bold text-xl">
                  ₹750 <span className="text-sm font-normal line-through opacity-60">₹1200</span>
                </p>
                <p className="text-xs text-[#f7c873]">Early Bird Offer</p>
              </div>
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-[14px] leading-7 text-[#6b5140] font-medium">
              Invest in your professional growth. Rethink your digital strategy. Build a dental
              brand that stands for something meaningful.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#registration"
                className="inline-flex items-center gap-2 rounded-full bg-[#1a0a2e] px-8 py-4 font-bold text-white shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition"
              >
                Register Now – ₹750 <ArrowRight size={18} />
              </a>
              <span className="text-sm text-[#8a7665]">📲 Scan QR code to register at venue</span>
            </div>
          </div>
        </div>
      </section>

      {/* REGISTRATION */}
      <section
        id="registration"
        className="scroll-mt-40 bg-[#16091f] px-4 py-16 sm:px-6 md:py-24 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(247,200,115,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center text-white font-body">
            <h2 className="font-display text-4xl font-[900] md:text-5xl">Reserve Your Seat</h2>
            <p className="mt-3 text-white/60">Pay ₹750 via UPI, then confirm details</p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[28px] bg-gradient-to-br from-[#f7c873] to-[#e5a044] p-7 text-[#1a0a2e] shadow-2xl font-body">
              <StepBadge n={1} label="Pay ₹750 via UPI" />
              <div className="mt-5 flex items-baseline gap-3">
                <span className="font-display text-4xl font-[900]">₹750</span>
                <span className="line-through opacity-60">₹1200</span>
                <span className="rounded-full bg-[#1a0a2e] px-3 py-1 text-xs font-bold text-white">
                  Save ₹450
                </span>
              </div>
              <div className="mt-6 md:hidden">
                <a
                  href={UPI_LINK}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a0a2e] px-6 py-4 font-bold text-white"
                >
                  <Smartphone size={20} />
                  Open UPI app & pay
                </a>
              </div>
              <div className="mt-6 hidden text-center md:block">
                <div className="mx-auto w-fit rounded-2xl bg-white p-4 shadow-xl">
                  <QRCodeSVG value={UPI_LINK} size={188} level="M" marginSize={1} />
                </div>
                <p className="mt-3 text-sm font-bold">Scan with any UPI app</p>
              </div>
              <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase opacity-60">
                <span className="h-px flex-1 bg-black/20" />
                or UPI ID
                <span className="h-px flex-1 bg-black/20" />
              </div>
              <CopyUpiId upiId={UPI_ID} />
            </div>
            <div className="rounded-[28px] bg-white p-7 shadow-2xl md:p-8 font-body">
              <StepBadge n={2} label="Confirm your seat" dark />
              {registered ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="mx-auto text-green-600" size={52} />
                  <h3 className="mt-4 font-display text-2xl font-bold">Registration Received</h3>
                </div>
              ) : (
                <RegistrationForm />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf5] px-4 py-16 sm:px-6 md:py-20 font-body">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#a05a18]">
              Got Questions?
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold text-[#1a0a2e] md:text-[42px]">
              Event FAQs
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.map((f, i) => (
              <FAQItem key={i} question={`${i + 1}. ${f.q}`} answer={f.a} />
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#0e0616] px-4 py-10 text-center text-sm text-white/60 font-body">
        <p className="font-display font-bold text-white">DIGITAL DENTAL DESIGNERS</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-[#f7c873] hover:underline">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </footer>
      {showStickyCta && !registered && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 p-3 backdrop-blur md:hidden">
          <a
            href="#registration"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a0a2e] px-6 py-3.5 font-bold text-white"
          >
            Register · ₹750 <ArrowRight size={18} />
          </a>
        </div>
      )}
    </main>
  );
}

function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const inputClass =
    "w-full rounded-xl border border-[#e8d5b8] bg-[#fffdf8] p-3.5 text-[15px] outline-none focus:border-[#e5a044] focus:ring-4 focus:ring-[#e5a044]/20";
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg("");
    setOk(false);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) throw new Error("VITE_API_URL missing");
      const fd = new FormData(e.currentTarget);
      const payload = {
        fullName: fd.get("fullName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        qualification: fd.get("qualification"),
        utr: fd.get("utr"),
      };
      const res = await fetch(`${apiUrl}/api/events/the-dentist-as-a-brand/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const r = await res.json();
      if (!res.ok || !r.success) throw new Error(r.message || "Failed");
      setOk(true);
      setMsg(r.message);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setOk(false);
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <Field label="Full name">
        <input name="fullName" required placeholder="Dr. Your Name" className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <input
            name="phone"
            type="tel"
            required
            placeholder="+91 98765 43210"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Qualification / Clinic">
        <input
          name="qualification"
          required
          placeholder="BDS, MDS - Smile Dental"
          className={inputClass}
        />
      </Field>
      <Field label="UTR">
        <input name="utr" required placeholder="12-digit UTR" className={inputClass} />
      </Field>
      {msg && (
        <div
          className={`rounded-xl border p-4 text-sm ${ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
        >
          {msg}
        </div>
      )}
      <button
        disabled={isSubmitting}
        className="w-full rounded-full bg-[#1a0a2e] px-6 py-4 font-bold text-white hover:bg-[#2a1440] disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit Registration · ₹750"}
      </button>
    </form>
  );
}
function CopyUpiId({ upiId }: { upiId: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 border border-black/5">
      <span className="break-all font-bold">{upiId}</span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#1a0a2e] px-4 py-2 text-xs font-bold text-white"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
function StepBadge({ n, label, dark }: { n: number; label: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold ${dark ? "bg-[#1a0a2e] text-white" : "bg-[#1a0a2e] text-[#f7c873]"}`}
      >
        {n}
      </span>
      <h3 className="font-display text-xl font-bold">{label}</h3>
    </div>
  );
}
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-2xl border border-[#f0dfc9] bg-white px-5 py-4 open:bg-[#fffaf5]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[#1a0a2e]">
        {question}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fdf2e2] group-open:bg-[#1a0a2e] group-open:text-white">
          <ChevronDown size={16} className="group-open:rotate-180 transition" />
        </span>
      </summary>
      <p className="mt-3 whitespace-pre-line text-[14px] leading-7 text-[#6b5140]">{answer}</p>
    </details>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-[#3d2314]">{label}</span>
      {children}
    </label>
  );
}
