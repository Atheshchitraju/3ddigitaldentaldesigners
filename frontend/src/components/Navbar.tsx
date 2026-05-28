import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/3D.webp";
import OrderModal from "@/components/OrderModal";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/equipment", label: "Equipment" },
  { to: "/shade", label: "Shade Matcher" },
  { to: "/designers", label: "Designers" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openOrder, setOpenOrder] = useState(false);

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
          {/* LOGO */}
          <Link to="/" preload="intent" className="flex items-center gap-3 group min-w-0">
            <div className="h-11 w-11 rounded-xl overflow-hidden shadow-glow ring-1 ring-primary/30 flex items-center justify-center bg-[#6B1F8C] shrink-0">
              <img
                src={logo}
                alt="3D Digital Dental Designers Lab logo"
                width={44}
                height={44}
                loading="eager"
                fetchPriority="high"
                decoding="async"
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

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
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
            ))}

            {/* ORDER BUTTON */}
            <button
              onClick={() => setOpenOrder(true)}
              className="ml-3 inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-200"
            >
              Place Order
            </button>
          </div>

          {/* MOBILE BUTTON */}
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

        {/* MOBILE MENU */}
        {open && (
          <div className="lg:hidden px-4 pb-4">
            <div className="glass mt-3 rounded-3xl p-4 flex flex-col gap-1 shadow-2xl border border-white/10 backdrop-blur-xl">
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

              {/* MOBILE ORDER BUTTON */}
              <button
                onClick={() => {
                  setOpen(false);
                  setOpenOrder(true);
                }}
                className="mt-3 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold shadow-lg"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ORDER MODAL */}
      <OrderModal open={openOrder} onClose={() => setOpenOrder(false)} />
    </>
  );
}
