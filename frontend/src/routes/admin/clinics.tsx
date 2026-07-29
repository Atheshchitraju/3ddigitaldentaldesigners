import { createFileRoute, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import API_URL from "../../config/api";
import ClinicLocationModal from "../../components/ClinicLocationModal";

export const Route = createFileRoute("/admin/clinics")({
  component: AdminClinicsPage,
});

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

function StatusBadge({ approved }: { approved: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${approved
          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
          : "bg-amber-100 text-amber-700 border-amber-300"
        }`}
    >
      {approved ? "Approved" : "Pending"}
    </span>
  );
}

function AdminClinicsPage() {
  const navigate = useNavigate();
  const router = useRouter();

  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<{
    [key: string]: { latitude: string; longitude: string };
  }>({});
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate({ to: "/admin/login" });
      return;
    }
    fetchClinics();

    // Warm the most-used destinations so their code + loader data are
    // already fetched by the time the user taps the nav button.
    router.preloadRoute({ to: "/admin/orders" }).catch(() => { });
    router.preloadRoute({ to: "/admin/bookings" }).catch(() => { });
    router.preloadRoute({ to: "/admin/scanners" }).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClinics = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await fetch(`${API_URL}/api/clinics/all`);
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setClinics(list);

      const locationData: any = {};
      list.forEach((clinic: any) => {
        locationData[clinic._id] = {
          latitude: clinic.latitude?.toString() || "",
          longitude: clinic.longitude?.toString() || "",
        };
      });
      setLocations(locationData);
    } catch (error) {
      console.log(error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate({ to: "/admin/login" });
  };

  const approveClinic = async (id: string) => {
    setClinics((prev) => prev.map((c) => (c._id === id ? { ...c, isApproved: true } : c)));
    try {
      await fetch(`${API_URL}/api/clinics/approve/${id}`, { method: "PUT" });
    } catch (error) {
      console.log(error);
      fetchClinics(false);
    }
  };

  const rejectClinic = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to reject this clinic?");
    if (!confirmed) return;

    const prevClinics = clinics;
    setClinics((prev) => prev.filter((c) => c._id !== id));
    try {
      await fetch(`${API_URL}/api/clinics/reject/${id}`, { method: "DELETE" });
    } catch (error) {
      console.log(error);
      setClinics(prevClinics);
    }
  };

  const saveLocation = async (id: string) => {
    try {
      setSavingId(id);
      await fetch(`${API_URL}/api/clinics/location/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: Number(locations[id].latitude),
          longitude: Number(locations[id].longitude),
        }),
      });
      alert("Location saved");
      fetchClinics(false);
    } catch (error) {
      console.log(error);
    } finally {
      setSavingId(null);
    }
  };

  // STATS (memoized)
  const stats = useMemo(
    () => ({
      total: clinics.length,
      approved: clinics.filter((c) => c.isApproved).length,
      pending: clinics.filter((c) => !c.isApproved).length,
    }),
    [clinics]
  );

  // FILTERS (memoized)
  const filteredClinics = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clinics.filter((clinic: any) => {
      const matchesSearch =
        !q ||
        clinic.name?.toLowerCase().includes(q) ||
        clinic.doctorName?.toLowerCase().includes(q) ||
        clinic.phone?.toLowerCase().includes(q) ||
        clinic.address?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Approved"
            ? clinic.isApproved
            : !clinic.isApproved;

      return matchesSearch && matchesStatus;
    });
  }, [clinics, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredClinics.length / PAGE_SIZE));
  const pagedClinics = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredClinics.slice(start, start + PAGE_SIZE);
  }, [filteredClinics, page]);

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

  const updateLocationField = (id: string, field: "latitude" | "longitude", value: string) => {
    setLocations((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Clearance so this page's header sits below the site navbar instead of under/behind it */}
      <div className="h-20 sm:h-24" />

      {/* TOP BAR (in normal flow — not sticky, so it never overlaps the site navbar) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Clinic Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
              Registered clinics in system
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Total Clinics", value: stats.total, color: "text-slate-900" },
            { label: "Approved", value: stats.approved, color: "text-emerald-600" },
            { label: "Pending", value: stats.pending, color: "text-amber-600" },
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
              placeholder="Search clinic, doctor, phone or address"
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
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Showing {filteredClinics.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filteredClinics.length)} of {filteredClinics.length}{" "}
            clinics
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
        {!loading && filteredClinics.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 shadow-sm">
            No clinics match your filters.
          </div>
        )}

        {/* MOBILE / TABLET: CARD LIST */}
        {!loading && filteredClinics.length > 0 && (
          <div className="lg:hidden space-y-3">
            {pagedClinics.map((clinic) => {
              const isOpen = expandedRow === clinic._id;
              const loc = locations[clinic._id] || { latitude: "", longitude: "" };
              return (
                <div
                  key={clinic._id}
                  className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-shadow ${isOpen ? "shadow-md ring-1 ring-slate-200" : ""
                    }`}
                >
                  <button
                    className="w-full text-left p-4 flex items-stretch gap-3"
                    onClick={() => setExpandedRow(isOpen ? null : clinic._id)}
                  >
                    <span
                      className={`w-1 rounded-full shrink-0 ${clinic.isApproved ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                    />

                    <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-sm shrink-0">
                      {getInitials(clinic.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900 truncate">
                          {clinic.name || "Unnamed clinic"}
                        </p>
                        <StatusBadge approved={!!clinic.isApproved} />
                      </div>

                      <p className="text-sm text-slate-500 truncate mt-0.5">
                        {clinic.doctorName || "-"}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <IconPhone />
                          {clinic.phone || "-"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <IconCalendar />
                          {clinic.createdAt
                            ? new Date(clinic.createdAt).toLocaleDateString()
                            : "-"}
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
                        <div className="grid grid-cols-1 gap-3 text-sm bg-white rounded-xl border border-slate-200 p-3">
                          <div>
                            <p className="text-slate-400 text-xs flex items-center gap-1">
                              <IconPin /> Address
                            </p>
                            <p className="font-medium text-slate-800">{clinic.address || "-"}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-2">
                          Coordinates
                        </p>
                        <div className="grid grid-cols-2 gap-3 bg-white rounded-xl border border-slate-200 p-3">
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Latitude</p>
                            <input
                              type="number"
                              step="any"
                              value={loc.latitude}
                              onChange={(e) =>
                                updateLocationField(clinic._id, "latitude", e.target.value)
                              }
                              className="w-full h-10 border border-slate-300 rounded-lg px-3 text-sm outline-none"
                            />
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Longitude</p>
                            <input
                              type="number"
                              step="any"
                              value={loc.longitude}
                              onChange={(e) =>
                                updateLocationField(clinic._id, "longitude", e.target.value)
                              }
                              className="w-full h-10 border border-slate-300 rounded-lg px-3 text-sm outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-2">
                          Actions
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setSelectedClinic(clinic);
                              setShowLocationModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-lg text-sm font-medium transition"
                          >
                            📍 Set Location
                          </button>
                          <button
                            onClick={() => saveLocation(clinic._id)}
                            disabled={savingId === clinic._id}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 rounded-lg text-sm font-medium transition disabled:opacity-60"
                          >
                            {savingId === clinic._id ? "Saving…" : "Save Location"}
                          </button>
                          {!clinic.isApproved && (
                            <button
                              onClick={() => approveClinic(clinic._id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 rounded-lg text-sm font-medium transition"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => rejectClinic(clinic._id)}
                            className="bg-red-600 hover:bg-red-700 text-white h-10 rounded-lg text-sm font-medium transition col-span-1"
                          >
                            Reject
                          </button>
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
        {!loading && filteredClinics.length > 0 && (
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {[
                      "Clinic",
                      "Doctor",
                      "Phone",
                      "Address",
                      "Latitude",
                      "Longitude",
                      "Status",
                      "Created",
                      "Actions",
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
                  {pagedClinics.map((clinic) => {
                    const loc = locations[clinic._id] || { latitude: "", longitude: "" };
                    return (
                      <tr
                        key={clinic._id}
                        className="border-t border-slate-100 hover:bg-slate-50/80 transition"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">{clinic.name}</td>
                        <td className="px-4 py-3">{clinic.doctorName || "-"}</td>
                        <td className="px-4 py-3">{clinic.phone}</td>
                        <td className="px-4 py-3 max-w-[220px] truncate" title={clinic.address}>
                          {clinic.address}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="any"
                            value={loc.latitude}
                            onChange={(e) =>
                              updateLocationField(clinic._id, "latitude", e.target.value)
                            }
                            className="w-28 border border-slate-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/30"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="any"
                            value={loc.longitude}
                            onChange={(e) =>
                              updateLocationField(clinic._id, "longitude", e.target.value)
                            }
                            className="w-28 border border-slate-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/30"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge approved={!!clinic.isApproved} />
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {clinic.createdAt
                            ? new Date(clinic.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedClinic(clinic);
                                setShowLocationModal(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
                            >
                              📍 Set
                            </button>
                            <button
                              onClick={() => saveLocation(clinic._id)}
                              disabled={savingId === clinic._id}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-60"
                            >
                              {savingId === clinic._id ? "Saving…" : "Save"}
                            </button>
                            {!clinic.isApproved && (
                              <button
                                onClick={() => approveClinic(clinic._id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => rejectClinic(clinic._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && filteredClinics.length > PAGE_SIZE && (
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

        <ClinicLocationModal
          open={showLocationModal}
          clinic={selectedClinic}
          onClose={() => {
            setShowLocationModal(false);
            setSelectedClinic(null);
          }}
          onSaved={() => fetchClinics(false)}
        />
      </div>
    </div>
  );
}

export default AdminClinicsPage;