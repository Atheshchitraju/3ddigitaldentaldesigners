import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/3D.webp";
import OrderModal from "@/components/OrderModal";

// const links = [
//   { to: "/", label: "Home" },
//   { to: "/clinics", label: "Clinics" },
//   { to: "/portfolio", label: "Portfolio" },
//   { to: "/about", label: "About" },
// ] as const;
const links = [
  { to: "/", label: "Home" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "About" },
] as const;

const dentistLinks = [
  { to: "/services", label: "Services" },
  { to: "/equipment", label: "Equipment" },
  // { to: "/shade", label: "Shade Matcher" },
  { to: "/designers", label: "Designers" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openOrder, setOpenOrder] = useState(false);
  const [dentistsOpen, setDentistsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass shadow-soft py-3 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent py-5"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" preload="intent" className="flex items-center gap-3 group min-w-0">
            <div className="h-11 w-11 rounded-xl overflow-hidden shadow-glow ring-1 ring-primary/30 flex items-center justify-center bg-[#6B1F8C] shrink-0">
              <img
                src={logo}
                alt="3D Digital Dental Designers Lab"
                width={44}
                height={44}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="leading-tight min-w-0">
              <div className="font-display text-[13px] sm:text-base font-bold tracking-tight text-black md:text-foreground leading-tight truncate">
                DIGITAL DENTAL
              </div>

              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-black/70 md:text-muted-foreground truncate">
                Designers Lab
              </div>
            </div>
          </Link>
          {/* Highlight Buttons */}
          <div className="hidden lg:flex items-center gap-3 ml-8">
            <Link
              to="/clinics"
              preload="intent"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold shadow-lg hover:scale-105 transition-all duration-200"
            >
              🏥 Clinics
            </Link>

            <Link
              to="/book-scanner"
              preload="intent"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg hover:scale-105 transition-all duration-200"
            >
              📡 Book Scanner
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1 ml-auto">
            {links.map((l) =>
              l.to === "/clinics" ? (
                <Link
                  key={l.to}
                  to={l.to}
                  preload="intent"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold shadow-md hover:scale-105 transition-all duration-200"
                >
                  {l.label}
                </Link>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  preload="intent"
                  className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-200 rounded-md"
                  activeProps={{
                    className: "px-3 py-2 text-sm font-semibold text-primary rounded-md",
                  }}
                >
                  {l.label}
                </Link>
              ),
            )}

            {/* Dentists Dropdown */}
            {/* <button
              onClick={() => setShowScannerModal(true)}
              className="ml-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg hover:scale-105 transition-all duration-200 animate-pulse"
            >
              📡 Book Scanner
            </button> */}
            <div className="relative">
              <button
                onClick={() => setDentistsOpen(!dentistsOpen)}
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary flex items-center gap-2"
              >
                For Dentists
                <span
                  className={`text-xs transition-transform duration-200 ${
                    dentistsOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {dentistsOpen && (
                <div className="absolute top-full left-0 mt-2 w-60 rounded-2xl bg-white border border-gray-100 shadow-2xl p-2 z-50">
                  {dentistLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      preload="intent"
                      onClick={() => setDentistsOpen(false)}
                      className="block rounded-xl px-4 py-3 text-sm hover:bg-purple-50 hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <button
                    onClick={() => {
                      setDentistsOpen(false);
                      setOpenOrder(true);
                    }}
                    className="block w-full text-left rounded-xl px-4 py-3 text-sm hover:bg-purple-50 hover:text-primary"
                  >
                    Order Form
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden rounded-xl p-2.5 hover:bg-white/10 transition-colors"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden px-4 pb-4">
            <div className="glass mt-3 rounded-3xl p-4 flex flex-col gap-1 shadow-2xl border border-white/10 backdrop-blur-xl">
              {/* Highlight Actions */}
              <Link
                to="/clinics"
                preload="intent"
                onClick={() => setOpen(false)}
                className="mx-2 my-1 px-4 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white shadow-md text-center"
              >
                🏥 Clinics
              </Link>

              <Link
                to="/book-scanner"
                preload="intent"
                onClick={() => setOpen(false)}
                className="mx-2 my-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-md text-center"
              >
                📡 Book Scanner
              </Link>

              {/* Normal Menu */}
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  preload="intent"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm font-medium rounded-xl hover:bg-white/10 transition-colors"
                >
                  {l.label}
                </Link>
              ))}

              <div className="border-t border-white/10 my-2 pt-2">
                <div className="px-4 py-2 text-xs uppercase tracking-wider text-gray-400">
                  For Dentists
                </div>

                {dentistLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    preload="intent"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-sm font-medium rounded-xl hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ))}

                <button
                  onClick={() => {
                    setOpen(false);
                    setOpenOrder(true);
                  }}
                  className="block w-full text-left px-4 py-3 text-sm font-medium rounded-xl hover:bg-white/10"
                >
                  Order Form
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      <OrderModal open={openOrder} onClose={() => setOpenOrder(false)} />
    </>
  );
}
