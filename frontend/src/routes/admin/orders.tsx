import { createFileRoute, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import API_URL from "../../config/api";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

const STATUS_OPTIONS = [
  "Placed",
  "Accepted",
  "Designing",
  "Printing",
  "Completed",
  "Delivered",
  "Rejected",
];

const STATUS_STYLES: Record<string, string> = {
  Placed: "bg-slate-100 text-slate-700 border-slate-300",
  Accepted: "bg-blue-100 text-blue-700 border-blue-300",
  Designing: "bg-amber-100 text-amber-700 border-amber-300",
  Printing: "bg-orange-100 text-orange-700 border-orange-300",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Delivered: "bg-purple-100 text-purple-700 border-purple-300",
  Rejected: "bg-red-100 text-red-700 border-red-300",
};

const STATUS_ACCENT: Record<string, string> = {
  Placed: "bg-slate-400",
  Accepted: "bg-blue-500",
  Designing: "bg-amber-500",
  Printing: "bg-orange-500",
  Completed: "bg-emerald-500",
  Delivered: "bg-purple-500",
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

function IconClinic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0">
      <path
        d="M4 21V8l8-4 8 4v13M4 21h16M9 21v-6h6v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
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

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_STYLES[status] || "bg-slate-100 text-slate-700 border-slate-300"
        }`}
    >
      {status}
    </span>
  );
}

function AdminOrdersPage() {
  const navigate = useNavigate();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [clinicFilter, setClinicFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate({ to: "/admin/login" });
      return;
    }
    fetchOrders();

    // Warm the most-used destinations so their code + loader data are
    // already fetched by the time the user taps the nav button.
    router.preloadRoute({ to: "/admin/bookings" }).catch(() => { });
    router.preloadRoute({ to: "/admin/scanners" }).catch(() => { });
    router.preloadRoute({ to: "/admin/clinics" }).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FETCH ORDERS
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        navigate({ to: "/admin/login" });
        return;
      }

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // UPDATE ORDER (optimistic — no full refetch, so the UI stays snappy)
  const updateOrder = useCallback(
    async (id: string, updates: any) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === id ? { ...o, ...updates } : o))
      );

      try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch(`${API_URL}/api/orders/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          navigate({ to: "/admin/login" });
          return;
        }

        const data = await response.json();
        if (!data.success) {
          // revert on failure
          fetchOrders();
        }
      } catch (error) {
        console.log(error);
        fetchOrders();
      }
    },
    [navigate, fetchOrders]
  );

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate({ to: "/admin/login" });
  };

  // EXPORT EXCEL
  const exportToExcel = () => {
    const exportData = filteredOrders.map((order: any) => ({
      OrderID: order.orderId,
      DoctorName: order.name,
      PatientName: order.patientName,
      PatientAge: order.patientAge,
      Phone: order.phone,
      Clinic: order.clinic,
      ClinicEmail: order.clinicEmail,
      WhatsApp: order.clinicWhatsapp,
      Product: order.product,
      Shade: order.shade,
      SelectedTeeth: Array.isArray(order.selectedTeeth)
        ? order.selectedTeeth.join(", ")
        : "",
      Notes: order.notes,
      Status: order.status,
      Designer: order.designer,
      PaymentStatus: order.paymentStatus,
      Amount: order.amount,
      PaymentID: order.paymentDetails?.razorpayPaymentId,
      PaymentMode: order.paymentDetails?.paymentMethod,
      OrderedDate: new Date(order.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, `Orders_${Date.now()}.xlsx`);
  };

  // CLINIC LIST (memoized — recompute only when orders change)
  const clinicList = useMemo(
    () => [...new Set(orders.map((o: any) => o.clinic).filter(Boolean))],
    [orders]
  );

  // STATS (memoized)
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) counts[o.status] = (counts[o.status] || 0) + 1;
    return {
      total: orders.length,
      placed: counts["Placed"] || 0,
      designing: counts["Designing"] || 0,
      completed: counts["Completed"] || 0,
      delivered: counts["Delivered"] || 0,
    };
  }, [orders]);

  // FILTERS (memoized — avoids recalculating on unrelated re-renders)
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order: any) => {
      const matchesSearch =
        !q ||
        order.orderId?.toLowerCase().includes(q) ||
        order.product?.toLowerCase().includes(q) ||
        order.name?.toLowerCase().includes(q) ||
        order.patientName?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All" ? true : order.status === statusFilter;
      const matchesClinic = clinicFilter === "All" ? true : order.clinic === clinicFilter;

      return matchesSearch && matchesStatus && matchesClinic;
    });
  }, [orders, search, statusFilter, clinicFilter]);

  // Reset to page 1 whenever filters change so the user isn't stranded on an empty page
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, clinicFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  const navButtons = [
    { label: "Orders", to: "/admin/orders", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Scanner Bookings", to: "/admin/bookings", color: "bg-purple-600 hover:bg-purple-700" },
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
              Order Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
              Manage all clinic orders and workflow
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
              onClick={exportToExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              Export Excel
            </button>
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
              onClick={exportToExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-medium text-left transition"
            >
              Export Excel
            </button>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Total Orders", value: stats.total, color: "text-slate-900" },
            { label: "Placed", value: stats.placed, color: "text-slate-700" },
            { label: "Designing", value: stats.designing, color: "text-amber-600" },
            { label: "Completed", value: stats.completed, color: "text-emerald-600" },
            { label: "Delivered", value: stats.delivered, color: "text-purple-600" },
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Search order ID, doctor or patient"
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
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              className="h-11 border border-slate-300 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            >
              <option value="All">All Clinics</option>
              {clinicList.map((clinic: any) => (
                <option key={clinic} value={clinic}>
                  {clinic}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Showing {filteredOrders.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length} orders
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
        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 shadow-sm">
            No orders match your filters.
          </div>
        )}

        {/* MOBILE / TABLET: CARD LIST */}
        {!loading && filteredOrders.length > 0 && (
          <div className="lg:hidden space-y-3">
            {pagedOrders.map((order) => {
              const isOpen = expandedRow === order.orderId;
              const accent = STATUS_ACCENT[order.status] || "bg-slate-400";
              return (
                <div
                  key={order.orderId}
                  className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-shadow ${isOpen ? "shadow-md ring-1 ring-slate-200" : ""
                    }`}
                >
                  <button
                    className="w-full text-left p-4 flex items-stretch gap-3"
                    onClick={() => setExpandedRow(isOpen ? null : order.orderId)}
                  >
                    {/* status accent stripe */}
                    <span className={`w-1 rounded-full ${accent} shrink-0`} />

                    {/* avatar */}
                    <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-sm shrink-0">
                      {getInitials(order.patientName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900 truncate">
                          {order.patientName || "Unnamed patient"}
                        </p>
                        <StatusBadge status={order.status} />
                      </div>

                      <p className="text-sm text-slate-500 truncate mt-0.5">
                        {order.product || "-"}
                        {order.shade ? ` · Shade ${order.shade}` : ""}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="font-mono bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-500">
                          {order.orderId}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <IconClinic />
                          {order.clinic || "-"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <IconCalendar />
                          {new Date(order.createdAt).toLocaleDateString()}
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
                          Patient &amp; Doctor
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm bg-white rounded-xl border border-slate-200 p-3">
                          <div>
                            <p className="text-slate-400 text-xs">Doctor</p>
                            <p className="font-medium text-slate-800">{order.name || "-"}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Patient Age</p>
                            <p className="font-medium text-slate-800">{order.patientAge || "-"}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs flex items-center gap-1">
                              <IconPhone /> Phone
                            </p>
                            <p className="font-medium text-slate-800">{order.phone || "-"}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">WhatsApp</p>
                            <p className="font-medium text-slate-800">
                              {order.clinicWhatsapp || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-2">
                          Order Details
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm bg-white rounded-xl border border-slate-200 p-3">
                          <div>
                            <p className="text-slate-400 text-xs">Clinic Email</p>
                            <p className="font-medium text-slate-800 break-all">
                              {order.clinicEmail || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Shade</p>
                            <p className="font-medium text-slate-800">{order.shade || "-"}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-slate-400 text-xs">Selected Teeth</p>
                            <p className="font-medium text-slate-800">
                              {Array.isArray(order.selectedTeeth)
                                ? order.selectedTeeth.join(", ")
                                : "-"}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-slate-400 text-xs">Notes</p>
                            <p className="font-medium text-slate-800">{order.notes || "-"}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-2">
                          Payment
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm bg-white rounded-xl border border-slate-200 p-3">
                          <div>
                            <p className="text-slate-400 text-xs">Payment Status</p>
                            <span
                              className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-xs font-semibold ${order.paymentStatus === "paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                                }`}
                            >
                              {order.paymentStatus || "-"}
                            </span>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Amount</p>
                            <p className="font-medium text-slate-800">₹{order.amount || 0}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Payment ID</p>
                            <p className="font-medium text-slate-800 break-all text-xs">
                              {order.paymentDetails?.razorpayPaymentId || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Payment Mode</p>
                            <p className="font-medium text-slate-800">
                              {order.paymentDetails?.paymentMethod || order.paymentMode || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-2">
                          Actions
                        </p>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrder(order.orderId, { status: e.target.value })
                            }
                            className="h-10 border border-slate-300 rounded-lg px-3 text-sm outline-none"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            defaultValue={order.designer}
                            placeholder="Assign designer"
                            onBlur={(e) =>
                              updateOrder(order.orderId, { designer: e.target.value })
                            }
                            className="h-10 border border-slate-300 rounded-lg px-3 text-sm outline-none"
                          />
                        </div>

                        <button
                          onClick={() =>
                            navigate({
                              to: "/admin/production/$orderId",
                              params: { orderId: order.orderId },
                            })
                          }
                          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-lg font-medium text-sm transition"
                        >
                          Open Production
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* DESKTOP: TABLE */}
        {!loading && filteredOrders.length > 0 && (
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1600px] text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {[
                      "Order ID",
                      "Doctor",
                      "Patient",
                      "Age",
                      "Phone",
                      "Clinic",
                      "Email",
                      "WhatsApp",
                      "Product",
                      "Shade",
                      "Teeth",
                      "Notes",
                      "Status",
                      "Designer",
                      "Production",
                      "Ordered",
                      "Delivered",
                      "Payment",
                      "Amount",
                      "Payment ID",
                      "Mode",
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
                  {pagedOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="border-t border-slate-100 hover:bg-slate-50/80 transition"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">{order.orderId}</td>
                      <td className="px-4 py-3">{order.name || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-blue-700">
                        {order.patientName || "-"}
                      </td>
                      <td className="px-4 py-3">{order.patientAge || "-"}</td>
                      <td className="px-4 py-3">{order.phone || "-"}</td>
                      <td className="px-4 py-3">{order.clinic || "-"}</td>
                      <td className="px-4 py-3 text-xs">{order.clinicEmail || "-"}</td>
                      <td className="px-4 py-3">{order.clinicWhatsapp || "-"}</td>
                      <td className="px-4 py-3">{order.product || "-"}</td>
                      <td className="px-4 py-3">{order.shade || "-"}</td>
                      <td className="px-4 py-3">
                        {Array.isArray(order.selectedTeeth)
                          ? order.selectedTeeth.join(", ")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 max-w-[220px] truncate" title={order.notes}>
                        {order.notes || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrder(order.orderId, { status: e.target.value })
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border outline-none ${STATUS_STYLES[order.status] ||
                            "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="text"
                          defaultValue={order.designer}
                          placeholder="Assign"
                          onBlur={(e) =>
                            updateOrder(order.orderId, { designer: e.target.value })
                          }
                          className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs w-[120px] outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            navigate({
                              to: "/admin/production/$orderId",
                              params: { orderId: order.orderId },
                            })
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          Open
                        </button>
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                        <div className="text-slate-400">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {order.deliveredAt ? (
                          <>
                            {new Date(order.deliveredAt).toLocaleDateString()}
                            <div className="text-slate-400">
                              {new Date(order.deliveredAt).toLocaleTimeString()}
                            </div>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold ${order.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {order.paymentStatus || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        ₹{order.amount || 0}
                      </td>
                      <td className="px-4 py-3 text-xs break-all max-w-[140px]">
                        {order.paymentDetails?.razorpayPaymentId || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {order.paymentDetails?.paymentMethod || order.paymentMode || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && filteredOrders.length > PAGE_SIZE && (
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