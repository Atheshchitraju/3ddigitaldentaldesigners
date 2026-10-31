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
      className="min-h-screen bg-[#fffaf5] text-[#321708] antialiased"
      style={{ paddingTop: GLOBAL_NAV_OFFSET }}
    >
      <header
        className="sticky z-40 border-b border-[#ead8c5] bg-[#fffaf5]/95 backdrop-blur"
        style={{ top: GLOBAL_NAV_OFFSET }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-[#542b12]">
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
          </Link>
          <span className="truncate text-xs font-bold tracking-wide sm:text-sm">
            DIGITAL DENTAL DESIGNERS
          </span>
          <a
            href="#registration"
            className="hidden items-center gap-1.5 rounded-full bg-[#321708] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#542b12] md:inline-flex"
          >
            <span>Register · ₹750</span>
            <span className="text-xs font-normal opacity-70 line-through">(₹1200)</span>
          </a>
          <span className="w-12 md:hidden" aria-hidden />
        </div>
      </header>

      {/* HERO - UPDATED WITH YOUR WHATSAPP MATTER */}
      <section className="relative overflow-hidden bg-[#260b2c] px-4 py-12 text-white sm:px-6 md:py-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#d89b39]/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#e5bd61] sm:text-sm">
                Digital Dental Designers presents
              </p>
              <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
                The Dentist<span className="block text-[#e7b94f]">As a Brand</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-[#f2d9a5] sm:text-xl">
                From Invisible Expertise to Remarkable Identity
              </p>
              <p className="mt-5 text-[15px] font-bold leading-7 text-white sm:text-[16px]">
                A 3-Hour Digital Branding & Content Masterclass for Dentists
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur">
                <span className="text-lg font-extrabold">₹750</span>
                <span className="text-sm line-through text-white/60">(₹1200)</span>
                <span className="ml-1 rounded-full bg-[#e5a044] px-2.5 py-0.5 text-xs font-bold text-[#321708]">
                  Save ₹450
                </span>
              </div>

              <div className="mt-6 space-y-4 text-[15px] leading-7 text-white/85 sm:leading-8">
                <p>
                  Your clinical expertise matters. Does your digital presence communicate what makes
                  you different?
                </p>
                <p>
                  In a crowded digital world, posting more is not the same as building a memorable
                  brand. Explore how dentists can move beyond generic social media content and
                  develop a distinctive, credible, and patient-centred digital identity.
                </p>
                <p className="font-medium text-white">
                  Join this STRATEGIC MASTERCLASS in dental branding, marketing psychology, and
                  content differentiation. This is not just another seminar with content ideas.
                </p>
                <div className="pt-3">
                  <div className="h-px w-12 bg-[#e5bd61]/50" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#e5bd61]">
                    WHAT MAKES THIS MASTERCLASS DIFFERENT?
                  </h3>
                  <p className="mt-2">
                    This is not a basic guide to posting reels. It is a strategic session about how
                    branding, patient psychology, and content can work together to help dental
                    professionals become easier to recognise, understand, and remember.
                  </p>
                </div>
              </div>
            </div>

            {/* AI IMAGE WITH TEXT BELOW */}
            <div className="mx-auto w-full max-w-lg">
              <div className="overflow-hidden rounded-3xl border border-[#d8a84b]/50 bg-white/5 p-3 shadow-2xl">
                <img
                  src={aiDentistryImage}
                  alt="AI Dentistry - Intelligent Diagnostics"
                  className="h-auto w-full rounded-2xl object-contain"
                  loading="eager"
                />
              </div>
              <div className="mt-5 rounded-3xl border border-[#d8a84b]/30 bg-white/10 p-6 backdrop-blur">
                <h3 className="flex items-center gap-2 text-lg font-extrabold leading-tight text-white">
                  <span>🧠</span> AI IN MODERN DENTISTRY
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-white/85">
                  Explore AI-powered clinical tools, smarter workflows and visual patient
                  communication to support better understanding and informed treatment decisions.
                </p>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-[#e5bd61]">
                  From Clinical Intelligence to Digital Practice Growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={<CalendarDays size={22} />}
            title="Date"
            value="15 November 2026"
            detail="Sunday"
          />
          <InfoCard
            icon={<Clock size={22} />}
            title="Time"
            value="10:00 AM – 1:00 PM"
            detail="3-hour masterclass"
          />
          <InfoCard
            icon={<MapPin size={22} />}
            title="Location"
            value="Bengaluru"
            detail="Venue shared with registered attendees"
          />
        </div>
      </section>

      <section className="bg-[#260b2c] px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5bd61] sm:text-sm">
              Meet Our Dental Experts
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
              Learn From Experienced Professionals
            </h2>
          </div>
          <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-[#d8a84b]/40 bg-white shadow-xl">
              <img
                src={vijayaLakshmiImage}
                alt="Dr. M. Vijaya Lakshmi Macherla"
                className="h-auto w-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="overflow-hidden rounded-3xl border border-[#d8a84b]/40 bg-white shadow-xl">
              <img
                src={rizwanaImage}
                alt="Dr. Rizwana Tarannum"
                className="h-auto w-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f8e9d9] px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b77924] sm:text-sm">
              Inside the 3-Hour Experience
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
              Five Frameworks in One Session
            </h2>
            <p className="mt-4 leading-7 text-[#6b5140]">
              Walk away with practical frameworks to help you build a more memorable and meaningful
              professional identity.
            </p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <NumberedCard
              number="01"
              title="Become Remarkable"
              description="Become remarkable rather than interchangeable and establish a distinctive professional identity."
            />
            <NumberedCard
              number="02"
              title="Understand Patients"
              description="Understand what patients really need and communicate your expertise more clearly."
            />
            <NumberedCard
              number="03"
              title="Build Recognition"
              description="Become recognisable and easier to recall through an intentional digital presence."
            />
            {/* <div className="rounded-3xl border border-[#5b1768]/20 bg-gradient-to-br from-[#260b2c] to-[#5b1768] p-6 text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-7">
              <p className="text-sm font-extrabold tracking-widest text-[#e5bd61]">04</p>
              <h3 className="mt-3 text-xl font-extrabold">🧠 AI IN MODERN DENTISTRY</h3>
              <p className="mt-1 text-sm font-bold text-[#e5bd61]">AI in Dentistry</p>
              <p className="mt-3 leading-7 text-white/80">
                Integrate intelligent tools into clinical workflows and patient communication.
              </p>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Explore AI-powered clinical tools, smarter workflows and visual patient
                communication to support better understanding and informed treatment decisions.
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#e5bd61]">
                From Clinical Intelligence to Digital Practice Growth.
              </p>
            </div> */}
          </div>
        </div>
      </section>

      <section id="registration" className="scroll-mt-40 bg-[#260b2c] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2">
              <span className="text-sm font-extrabold">Early bird · ₹750</span>
              <span className="text-xs line-through text-white/60">(₹1200)</span>
            </div>
            <h2 className="mt-3 text-3xl font-extrabold md:text-5xl">Reserve Your Seat</h2>
            <p className="mt-4 leading-7 text-white/75">
              Pay <span className="font-bold text-white">₹750</span>{" "}
              <span className="line-through text-white/60">(₹1200)</span> by UPI, then submit your
              details.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
            <div className="rounded-3xl bg-gradient-to-br from-[#e8a052] to-[#f3d49c] p-6 text-[#321708] shadow-xl md:p-8">
              <StepBadge n={1} label="Pay ₹750 via UPI" />
              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold">₹750</span>
                <span className="text-lg line-through text-[#542b12]/60">(₹1200)</span>
                <span className="rounded-full bg-[#321708] px-3 py-1 text-xs font-bold text-white">
                  Save ₹450
                </span>
              </div>
              <div className="mt-6 md:hidden">
                <a
                  href={UPI_LINK}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#321708] px-6 py-4 font-bold text-white transition hover:bg-[#542b12]"
                >
                  <Smartphone size={20} />
                  Open UPI app &amp; pay ₹750
                </a>
              </div>
              <div className="mt-6 hidden text-center md:block">
                <div className="mx-auto w-fit rounded-2xl bg-white p-4 shadow-md">
                  <QRCodeSVG value={UPI_LINK} size={188} level="M" marginSize={1} />
                </div>
                <p className="mt-4 flex items-center justify-center gap-2 font-bold">
                  <Smartphone size={18} />
                  Scan with any UPI app
                </p>
              </div>
              <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-[#542b12]">
                <span className="h-px flex-1 bg-[#542b12]/25" />
                or pay to UPI ID
                <span className="h-px flex-1 bg-[#542b12]/25" />
              </div>
              <CopyUpiId upiId={UPI_ID} />
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-xl md:p-8">
              <StepBadge n={2} label="Confirm your seat" dark />
              {registered ? (
                <div className="py-8 text-center" role="status">
                  <CheckCircle2 className="mx-auto text-green-600" size={52} />
                  <h3 className="mt-4 text-2xl font-extrabold">Registration Received</h3>
                </div>
              ) : (
                <RegistrationForm />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf5] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b77924] sm:text-sm">
              Got Questions?
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Event FAQs</h2>
            <p className="mt-3 text-[#6b5140]">Everything you need to know before you register</p>
          </div>
          <div className="mt-8 space-y-3">
            {FAQS.map((f, i) => (
              <FAQItem key={i} question={`${i + 1}. ${f.q}`} answer={f.a} />
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#14041a] px-4 pb-24 pt-8 text-center text-sm text-white/70 sm:px-6 md:pb-8">
        <p className="font-semibold text-white">DIGITAL DENTAL DESIGNERS</p>
        <Link to="/" className="mt-5 inline-flex items-center gap-2 text-[#e5bd61] hover:underline">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </footer>

      {showStickyCta && !registered && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#ead8c5] bg-[#fffaf5]/95 p-3 backdrop-blur md:hidden">
          <a
            href="#registration"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#321708] px-6 py-3.5 font-bold text-white"
          >
            Register · ₹750{" "}
            <span className="text-xs font-normal opacity-60 line-through">(₹1200)</span>
            <ArrowRight size={18} />
          </a>
        </div>
      )}
    </main>
  );
}

function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const inputClass =
    "w-full rounded-xl border border-[#e5c9a7] bg-white p-3 text-base outline-none transition focus:border-[#b77924] focus:ring-2 focus:ring-[#e5a044]/40";
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setRegistrationMessage("");
    setRegistrationSuccess(false);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) throw new Error("VITE_API_URL is not set in .env");
      const form = event.currentTarget;
      const formData = new FormData(form);
      const payload = {
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        qualification: formData.get("qualification"),
        utr: formData.get("utr"),
      };
      const response = await fetch(`${apiUrl}/api/events/the-dentist-as-a-brand/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Registration could not be submitted.");
      setRegistrationSuccess(true);
      setRegistrationMessage(result.message);
      form.reset();
    } catch (error) {
      setRegistrationSuccess(false);
      setRegistrationMessage(error instanceof Error ? error.message : "Something went wrong.");
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
        <Field label="Email address">
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>
        <Field label="Phone number">
          <input
            name="phone"
            type="tel"
            required
            placeholder="+91 98765 43210"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Dental qualification / clinic name">
        <input
          name="qualification"
          required
          placeholder="e.g. BDS, MDS - Smile Dental Clinic"
          className={inputClass}
        />
      </Field>
      <Field label="Payment reference / UTR number">
        <input name="utr" required placeholder="12-digit UTR" className={inputClass} />
      </Field>
      {registrationMessage && (
        <div
          role="status"
          className={`rounded-xl border p-4 text-sm ${registrationSuccess ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
        >
          {registrationMessage}
        </div>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[#5b1768] px-6 py-4 font-bold text-white transition hover:bg-[#42104d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          "Submitting..."
        ) : (
          <>
            Submit Registration – ₹750{" "}
            <span className="font-normal line-through opacity-70">(₹1200)</span>
          </>
        )}
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
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3">
      <span className="break-all text-base font-extrabold sm:text-lg">{upiId}</span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#321708] px-3.5 py-2 text-xs font-bold text-white"
      >
        <>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </>
      </button>
    </div>
  );
}
function StepBadge({ n, label, dark }: { n: number; label: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold ${dark ? "bg-[#321708] text-white" : "bg-[#321708] text-[#f3d49c]"}`}
      >
        {n}
      </span>
      <h3 className="text-xl font-extrabold">{label}</h3>
    </div>
  );
}
function InfoCard({
  icon,
  title,
  value,
  detail,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[#ead8c5] bg-white p-6">
      <div className="flex items-center gap-3 text-[#b77924]">
        {icon}
        <p className="text-sm font-bold uppercase tracking-wide">{title}</p>
      </div>
      <p className="mt-4 text-xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-[#8a7665]">{detail}</p>
    </div>
  );
}
function NumberedCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-[#e8d0b4] bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl md:p-7">
      <p className="text-sm font-extrabold tracking-widest text-[#b77924]">{number}</p>
      <h3 className="mt-3 text-xl font-extrabold">{title}</h3>
      <p className="mt-3 leading-7 text-[#6b5140]">{description}</p>
    </div>
  );
}
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-2xl border border-[#e5c9a7] bg-white px-5 py-4 open:bg-[#fffaf5]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[#321708]">
        {question}
        <ChevronDown
          size={20}
          className="shrink-0 transition group-open:rotate-180 text-[#b77924]"
        />
      </summary>
      <p className="mt-3 whitespace-pre-line leading-7 text-[#6b5140]">{answer}</p>
    </details>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#542b12]">{label}</span>
      {children}
    </label>
  );
}
