import { createFileRoute, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import API_URL from "../../config/api";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookingsPage,
});

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 border-amber-300",
  Approved: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Rejected: "bg-red-100 text-red-700 border-red-300",
};

const STATUS_ACCENT: Record<string, string> = {
  Pending: "bg-amber-500",
  Approved: "bg-emerald-500",
  Rejected: "bg-red-500",
};

const PAGE_SIZE = 15;

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "").concat(parts[1]?.[0] || "").toUpperCase() || "?";
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0">
      <path
        d="M6.6 10.8c1.3 2.6 3.4 4.7 6 6l2-2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.8c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2 2.2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0">
      <path
        d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconScanner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = status || "Pending";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_STYLES[label] || "bg-slate-100 text-slate-700 border-slate-300"
        }`}
    >
      {label}
    </span>
  );
}

function AdminBookingsPage() {
  const navigate = useNavigate();
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate({ to: "/admin/login" });
      return;
    }
    fetchBookings();

    // Warm the most-used destinations so their code + loader data are
    // already fetched by the time the user taps the nav button.
    router.preloadRoute({ to: "/admin/orders" }).catch(() => { });
    router.preloadRoute({ to: "/admin/scanners" }).catch(() => { });
    router.preloadRoute({ to: "/admin/clinics" }).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/bookings`);
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate({ to: "/admin/login" });
  };

  // STATS (memoized)
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of bookings) {
      const s = b.status || "Pending";
      counts[s] = (counts[s] || 0) + 1;
    }
    return {
      total: bookings.length,
      pending: counts["Pending"] || 0,
      approved: counts["Approved"] || 0,
      rejected: counts["Rejected"] || 0,
    };
  }, [bookings]);

  // FILTERS (memoized)
  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b: any) => {
      const matchesSearch =
        !q ||
        b.clinicName?.toLowerCase().includes(q) ||
        b.clinicAddress?.toLowerCase().includes(q) ||
        b.scannerId?.toLowerCase().includes(q) ||
        b.phone?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All" ? true : (b.status || "Pending") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const pagedBookings = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredBookings.slice(start, start + PAGE_SIZE);
  }, [filteredBookings, page]);

  const navButtons = [
    { label: "Orders", to: "/admin/orders", color: "bg-blue-600 hover:bg-blue-700" },
    {
      label: "Scanner Bookings",
      to: "/admin/bookings",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    { label: "Active Scanners", to: "/admin/scanners", color: "bg-cyan-600 hover:bg-cyan-700" },
    { label: "Clinics", to: "/admin/clinics", color: "bg-orange-600 hover:bg-orange-700" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Clearance so this page's header sits below the site navbar instead of under/behind it */}
      <div className="h-20 sm:h-24" />

      {/* TOP BAR (in normal flow — not sticky, so it never overlaps the site navbar) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Scanner Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
              Registered scanners in system
            </p>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex flex-wrap items-center gap-2">
            {navButtons.map((btn) => (
              <Link
                key={btn.label}
                to={btn.to as any}
                preload="intent"
                className={`${btn.color} text-white px-4 py-2.5 rounded-xl text-sm font-medium transition [&.active]:ring-2 [&.active]:ring-offset-1 [&.active]:ring-black/20`}
              >
                {btn.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-300 text-slate-700"
            aria-label="Menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile nav drawer */}
        {menuOpen && (
          <div className="lg:hidden px-4 pb-4 flex flex-col gap-2 border-t border-slate-100 pt-3">
            {navButtons.map((btn) => (
              <Link
                key={btn.label}
                to={btn.to as any}
                preload="intent"
                onClick={() => setMenuOpen(false)}
                className={`${btn.color} text-white px-4 py-3 rounded-xl text-sm font-medium text-left transition block`}
              >
                {btn.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-medium text-left transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Total Bookings", value: stats.total, color: "text-slate-900" },
            { label: "Pending", value: stats.pending, color: "text-amber-600" },
            { label: "Approved", value: stats.approved, color: "text-emerald-600" },
            { label: "Rejected", value: stats.rejected, color: "text-red-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm"
            >
              <p className="text-xs sm:text-sm text-slate-500">{s.label}</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 rounded mt-2 animate-pulse" />
              ) : (
                <h2 className={`text-2xl sm:text-3xl font-bold mt-1 ${s.color}`}>{s.value}</h2>
              )}
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Search clinic, address, phone or scanner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 border border-slate-300 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 border border-slate-300 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Showing {filteredBookings.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filteredBookings.length)} of {filteredBookings.length}{" "}
            bookings
          </p>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl h-16 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredBookings.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 shadow-sm">
            No bookings match your filters.
          </div>
        )}

        {/* MOBILE / TABLET: CARD LIST */}
        {!loading && filteredBookings.length > 0 && (
          <div className="lg:hidden space-y-3">
            {pagedBookings.map((booking) => {
              const status = booking.status || "Pending";
              const isOpen = expandedRow === booking._id;
              const accent = STATUS_ACCENT[status] || "bg-slate-400";
              return (
                <div
                  key={booking._id}
                  className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-shadow ${isOpen ? "shadow-md ring-1 ring-slate-200" : ""
                    }`}
                >
                  <button
                    className="w-full text-left p-4 flex items-stretch gap-3"
                    onClick={() => setExpandedRow(isOpen ? null : booking._id)}
                  >
                    <span className={`w-1 rounded-full ${accent} shrink-0`} />

                    <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-sm shrink-0">
                      {getInitials(booking.clinicName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900 truncate">
                          {booking.clinicName || "Unnamed clinic"}
                        </p>
                        <StatusBadge status={status} />
                      </div>

                      <p className="text-sm text-slate-500 truncate mt-0.5 flex items-center gap-1">
                        <IconScanner />
                        {booking.scannerId || "-"}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <IconCalendar />
                          {booking.bookingDate || "-"} {booking.bookingTime || ""}
                        </span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <IconPin />
                          {booking.clinicAddress || "-"}
                        </span>
                      </div>
                    </div>

                    <span className="text-slate-300 shrink-0 self-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/60">
                      <div>
                        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-2">
                          Clinic Details
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm bg-white rounded-xl border border-slate-200 p-3">
                          <div className="col-span-2">
                            <p className="text-slate-400 text-xs">Address</p>
                            <p className="font-medium text-slate-800">
                              {booking.clinicAddress || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs flex items-center gap-1">
                              <IconPhone /> Phone
                            </p>
                            <p className="font-medium text-slate-800">{booking.phone || "-"}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Scanner Location</p>
                            <p className="font-medium text-slate-800">
                              {booking.scannerLocation || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-2">
                          Booking
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm bg-white rounded-xl border border-slate-200 p-3">
                          <div>
                            <p className="text-slate-400 text-xs">Booking Date</p>
                            <p className="font-medium text-slate-800">
                              {booking.bookingDate || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Booking Time</p>
                            <p className="font-medium text-slate-800">
                              {booking.bookingTime || "-"}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-slate-400 text-xs">Created</p>
                            <p className="font-medium text-slate-800">
                              {booking.createdAt
                                ? new Date(booking.createdAt).toLocaleString()
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* DESKTOP: TABLE */}
        {!loading && filteredBookings.length > 0 && (
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {[
                      "Clinic",
                      "Address",
                      "Phone",
                      "Scanner",
                      "Scanner Location",
                      "Booking Date",
                      "Booking Time",
                      "Status",
                      "Created",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {pagedBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="border-t border-slate-100 hover:bg-slate-50/80 transition"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {booking.clinicName || "-"}
                      </td>
                      <td className="px-4 py-3 max-w-[220px] truncate" title={booking.clinicAddress}>
                        {booking.clinicAddress || "-"}
                      </td>
                      <td className="px-4 py-3">{booking.phone || "-"}</td>
                      <td className="px-4 py-3">{booking.scannerId || "-"}</td>
                      <td className="px-4 py-3">{booking.scannerLocation || "-"}</td>
                      <td className="px-4 py-3">{booking.bookingDate || "-"}</td>
                      <td className="px-4 py-3">{booking.bookingTime || "-"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status || "Pending"} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && filteredBookings.length > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-slate-50 transition"
            >
              Prev
            </button>
            <span className="text-sm text-slate-500 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-slate-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBookingsPage;