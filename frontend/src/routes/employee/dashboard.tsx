import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import API_URL from "../../config/api";

export const Route = createFileRoute("/employee/dashboard")({
  component: EmployeesPage,
});

// ─────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────

type Employee = {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string | null;
  workingStatus: string;
  status: string;
};

type Toast = { id: number; kind: "success" | "error"; text: string };
type StatFilter = "all" | "active" | "busy" | "available";

const DEPARTMENTS = [
  "Designer",
  "Printer",
  "Metalist",
  "Ceramist",
  "QC",
  "Dispatch",
] as const;

// Department = a real stage in the production pipeline, in order.
// The numbering encodes that sequence — it isn't decorative.
const STAGE_NUMBER: Record<string, number> = {
  Designer: 1,
  Printer: 2,
  Metalist: 3,
  Ceramist: 4,
  QC: 5,
  Dispatch: 6,
};

const STAGE_COLOR: Record<string, string> = {
  Designer: "#6F6BC7", // concept / ideation
  Printer: "#2F8FA6", // ink / process
  Metalist: "#9C7A3C", // brass / metal
  Ceramist: "#BE8C5A", // clay / kiln
  QC: "#3F7A5C", // pass / check
  Dispatch: "#3B5B8C", // shipping
};

const AVATAR_PALETTE = [
  "#6F6BC7",
  "#2F8FA6",
  "#9C7A3C",
  "#BE8C5A",
  "#3F7A5C",
  "#3B5B8C",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  return letters || "?";
}

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

// ─────────────────────────────────────────────────────────────────────────
// Icons (inline, no extra dependency)
// ─────────────────────────────────────────────────────────────────────────

const Icon = {
  Search: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" {...p}>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Plus: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" {...p}>
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Close: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" {...p}>
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  Toggle: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" {...p}>
      <rect x="2.5" y="6" width="15" height="8" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7.5" cy="10" r="2.4" fill="currentColor" />
    </svg>
  ),
  Trash: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" {...p}>
      <path
        d="M4 6h12M8 6V4.5A1.5 1.5 0 019.5 3h1A1.5 1.5 0 0112 4.5V6m-6.5 0l.6 9.4A1.5 1.5 0 007.6 17h4.8a1.5 1.5 0 001.5-1.6L14.5 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Pencil: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" {...p}>
      <path
        d="M13.4 3.6l3 3L6 17H3v-3l10.4-10.4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Users: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" fill="none" {...p}>
      <circle cx="18" cy="16" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 38c0-7 5.4-12 12-12s12 5 12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="33" cy="14" r="4.5" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
      <path d="M31 24c5 .4 9 4.6 9 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    </svg>
  ),
  Check: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" {...p}>
      <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Alert: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" {...p}>
      <path d="M10 3l8 14H2l8-14z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 8.5v3.2M10 14.4v.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Tokens (scoped custom properties + font import)
// ─────────────────────────────────────────────────────────────────────────

function DesignTokens() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
      .employees-page {
        --ink: #1B1918;
        --paper: #F7F5F1;
        --panel: #FFFFFF;
        --line: #E7E2D9;
        --muted: #8A8578;
        --brass: #9C7A3C;
        --brass-soft: #F1E9D8;
        --ok: #3F7A5C;
        --ok-soft: #E4EFE8;
        --busy: #C08A2E;
        --busy-soft: #FBF0DD;
        --available: #3E7CB1;
        --available-soft: #E4EEF6;
        --danger: #B23B3B;
        --danger-soft: #F8E7E5;
        font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        color: var(--ink);
        background: var(--paper);
      }
      .employees-page .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
      .employees-page .font-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
      @media (prefers-reduced-motion: reduce) {
        .employees-page * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
      }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Small presentational pieces
// ─────────────────────────────────────────────────────────────────────────

function StageBadge({ department }: { department: string | null }) {
  if (!department) {
    return <span className="text-sm text-[var(--muted)]">—</span>;
  }
  const color = STAGE_COLOR[department] ?? "#8A8578";
  const num = STAGE_NUMBER[department];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{ borderColor: `${color}40`, background: `${color}14`, color }}
    >
      {num && <span className="font-mono text-[10px] opacity-70">{String(num).padStart(2, "0")}</span>}
      {department}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const active = status === "Active";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        background: active ? "var(--ok-soft)" : "var(--danger-soft)",
        color: active ? "var(--ok)" : "var(--danger)",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
      {status}
    </span>
  );
}

function WorkingPill({ workingStatus }: { workingStatus: string }) {
  const styleMap: Record<string, { bg: string; fg: string }> = {
    Available: { bg: "var(--available-soft)", fg: "var(--available)" },
    Busy: { bg: "var(--busy-soft)", fg: "var(--busy)" },
  };
  const s = styleMap[workingStatus] ?? { bg: "#EEECE7", fg: "var(--muted)" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: s.bg, color: s.fg }}
    >
      {workingStatus}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const color = avatarColor(name);
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ background: color }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

function IconButton({
  label,
  onClick,
  tone = "default",
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] transition
        hover:bg-[var(--paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-1
        disabled:cursor-not-allowed disabled:opacity-40
        ${tone === "danger" ? "text-[var(--danger)] hover:bg-[var(--danger-soft)]" : "text-[var(--ink)]"}`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "Employee",
  department: "Designer",
};

function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [statFilter, setStatFilter] = useState<StatFilter>("all");

  const [confirmTarget, setConfirmTarget] = useState<Employee | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const getToken = () => localStorage.getItem("adminToken");

  const pushToast = (kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.success) {
        setEmployees(data.employees);
      } else {
        setLoadError(true);
      }
    } catch (err) {
      console.log(err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        pushToast("error", data.message || "Could not create employee.");
        return;
      }

      pushToast("success", `${form.name} was added.`);
      setPanelOpen(false);
      setForm(initialForm);
      fetchEmployees();
    } catch (err) {
      console.log(err);
      pushToast("error", "Something went wrong creating the employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEmployee = async (employee: Employee) => {
    try {
      const response = await fetch(`${API_URL}/api/employees/${employee._id}/toggle`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!data.success) {
        pushToast("error", data.message || "Could not update status.");
        return;
      }
      pushToast("success", `${employee.name}'s status was updated.`);
      fetchEmployees();
    } catch (err) {
      console.log(err);
      pushToast("error", "Something went wrong updating that employee.");
    }
  };

  const deleteEmployee = async (employee: Employee) => {
    try {
      const response = await fetch(`${API_URL}/api/employees/${employee._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!data.success) {
        pushToast("error", data.message || "Could not delete employee.");
        return;
      }
      pushToast("success", `${employee.name} was removed.`);
      fetchEmployees();
    } catch (err) {
      console.log(err);
      pushToast("error", "Something went wrong deleting that employee.");
    } finally {
      setConfirmTarget(null);
    }
  };

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesSearch =
        !q ||
        employee.name.toLowerCase().includes(q) ||
        (employee.department ?? "").toLowerCase().includes(q) ||
        employee.employeeId.toLowerCase().includes(q);

      const matchesDept = deptFilter === "All" || employee.department === deptFilter;

      const matchesStat =
        statFilter === "all" ||
        (statFilter === "active" && employee.status === "Active") ||
        (statFilter === "busy" && employee.workingStatus === "Busy") ||
        (statFilter === "available" && employee.workingStatus === "Available");

      return matchesSearch && matchesDept && matchesStat;
    });
  }, [employees, search, deptFilter, statFilter]);

  const counts = {
    total: employees.length,
    active: employees.filter((e) => e.status === "Active").length,
    busy: employees.filter((e) => e.workingStatus === "Busy").length,
    available: employees.filter((e) => e.workingStatus === "Available").length,
  };

  const toggleStat = (key: StatFilter) => setStatFilter((cur) => (cur === key ? "all" : key));

  return (
    <div className="employees-page min-h-screen pb-28 md:pb-10">
      <DesignTokens />

      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
        {/* Header */}
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[28px] font-semibold leading-tight md:text-[34px]">
              Employee Management
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Track who's on the floor, across every stage of production.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="hidden shrink-0 items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-white
              transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 md:inline-flex"
          >
            <Icon.Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>

        {/* Stat rail: 4-up grid on desktop, scroll-snap strip on mobile */}
        <div className="mb-6 -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0">
          <StatCard label="Total Employees" value={counts.total} active={statFilter === "all"} onClick={() => setStatFilter("all")} />
          <StatCard
            label="Active"
            value={counts.active}
            color="var(--ok)"
            active={statFilter === "active"}
            onClick={() => toggleStat("active")}
          />
          <StatCard
            label="Busy"
            value={counts.busy}
            color="var(--busy)"
            active={statFilter === "busy"}
            onClick={() => toggleStat("busy")}
          />
          <StatCard
            label="Available"
            value={counts.available}
            color="var(--available)"
            active={statFilter === "available"}
            onClick={() => toggleStat("available")}
          />
        </div>

        {/* Toolbar */}
        <div className="mb-5 space-y-3">
          <div className="relative">
            <Icon.Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search by name, ID, or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] py-3 pl-10 pr-4 text-sm
                placeholder:text-[var(--muted)] focus:border-[var(--brass)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]/25"
            />
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
            <FilterChip label="All Stages" active={deptFilter === "All"} onClick={() => setDeptFilter("All")} />
            {DEPARTMENTS.map((d) => (
              <FilterChip
                key={d}
                label={d}
                color={STAGE_COLOR[d]}
                active={deptFilter === d}
                onClick={() => setDeptFilter(d)}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-sm">
          {loading ? (
            <LoadingState />
          ) : loadError ? (
            <ErrorState onRetry={fetchEmployees} />
          ) : filteredEmployees.length === 0 ? (
            <EmptyState
              hasAnyEmployees={employees.length > 0}
              onAdd={() => setPanelOpen(true)}
              onClearFilters={() => {
                setSearch("");
                setDeptFilter("All");
                setStatFilter("all");
              }}
            />
          ) : (
            <>
              {/* Desktop worktable */}
              <table className="hidden w-full text-sm md:table">
                <thead>
                  <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                    <th className="px-5 py-3.5 font-medium">Employee</th>
                    <th className="px-3 py-3.5 font-medium">Stage</th>
                    <th className="px-3 py-3.5 font-medium">Status</th>
                    <th className="px-3 py-3.5 font-medium">Working</th>
                    <th className="px-5 py-3.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee._id}
                      className="border-b border-[var(--line)] last:border-0 transition hover:bg-[var(--paper)]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={employee.name} />
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="font-mono text-xs text-[var(--muted)]">{employee.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <StageBadge department={employee.department} />
                      </td>
                      <td className="px-3 py-3.5">
                        <StatusPill status={employee.status} />
                      </td>
                      <td className="px-3 py-3.5">
                        <WorkingPill workingStatus={employee.workingStatus} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <IconButton label="Edit (coming soon)" disabled>
                            <Icon.Pencil className="h-3.5 w-3.5" />
                          </IconButton>
                          <IconButton label="Toggle status" onClick={() => toggleEmployee(employee)}>
                            <Icon.Toggle className="h-3.5 w-3.5" />
                          </IconButton>
                          <IconButton label="Delete employee" tone="danger" onClick={() => setConfirmTarget(employee)}>
                            <Icon.Trash className="h-3.5 w-3.5" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile card list */}
              <ul className="divide-y divide-[var(--line)] md:hidden">
                {filteredEmployees.map((employee) => (
                  <li key={employee._id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={employee.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate font-medium">{employee.name}</div>
                          <span className="font-mono text-[11px] text-[var(--muted)]">{employee.employeeId}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <StageBadge department={employee.department} />
                          <StatusPill status={employee.status} />
                          <WorkingPill workingStatus={employee.workingStatus} />
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled
                            className="flex-1 rounded-lg border border-[var(--line)] py-2 text-xs font-medium text-[var(--muted)] disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleEmployee(employee)}
                            className="flex-1 rounded-lg border border-[var(--line)] py-2 text-xs font-medium transition hover:bg-[var(--paper)]"
                          >
                            Toggle
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmTarget(employee)}
                            className="flex-1 rounded-lg border border-[var(--danger)]/30 py-2 text-xs font-medium text-[var(--danger)] transition hover:bg-[var(--danger-soft)]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Mobile floating action button */}
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        aria-label="Add employee"
        className="fixed bottom-6 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ink)] text-white shadow-lg
          transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 md:hidden"
      >
        <Icon.Plus className="h-6 w-6" />
      </button>

      <AddEmployeePanel
        open={panelOpen}
        form={form}
        setForm={setForm}
        submitting={submitting}
        onClose={() => setPanelOpen(false)}
        onSubmit={createEmployee}
      />

      <ConfirmDialog
        employee={confirmTarget}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && deleteEmployee(confirmTarget)}
      />

      <ToastStack toasts={toasts} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Stat card / filter chip
// ─────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color = "var(--ink)",
  active,
  onClick,
}: {
  label: string;
  value: number;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[150px] shrink-0 snap-start rounded-xl border bg-[var(--panel)] p-4 text-left transition
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-1
        md:min-w-0 ${active ? "border-[var(--ink)] shadow-sm" : "border-[var(--line)] hover:border-[var(--muted)]"}`}
    >
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold" style={{ color }}>
        {value}
      </p>
    </button>
  );
}

function FilterChip({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-1
        ${active ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] hover:border-[var(--muted)]"}`}
    >
      {!active && color && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: color }} />
      )}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// States: loading / error / empty
// ─────────────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="divide-y divide-[var(--line)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 md:px-5">
          <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--paper)]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--paper)]" />
            <div className="h-2.5 w-1/5 animate-pulse rounded bg-[var(--paper)]" />
          </div>
          <div className="hidden h-6 w-20 animate-pulse rounded-full bg-[var(--paper)] md:block" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-14 text-center">
      <Icon.Alert className="h-8 w-8 text-[var(--danger)]" />
      <div>
        <p className="font-medium">Couldn't load employees</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Check your connection and try again.</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--paper)]"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState({
  hasAnyEmployees,
  onAdd,
  onClearFilters,
}: {
  hasAnyEmployees: boolean;
  onAdd: () => void;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 p-14 text-center">
      <Icon.Users className="h-12 w-12 text-[var(--muted)]" />
      {hasAnyEmployees ? (
        <>
          <div>
            <p className="font-medium">No employees match these filters</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Try a different search term or clear your filters.</p>
          </div>
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-1 rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--paper)]"
          >
            Clear filters
          </button>
        </>
      ) : (
        <>
          <div>
            <p className="font-medium">No employees yet</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Add your first team member to start staffing orders.</p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="mt-1 inline-flex items-center gap-2 rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Icon.Plus className="h-4 w-4" />
            Add Employee
          </button>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Add Employee panel — side sheet on desktop, bottom sheet on mobile
// ─────────────────────────────────────────────────────────────────────────

function AddEmployeePanel({
  open,
  form,
  setForm,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  form: typeof initialForm;
  setForm: React.Dispatch<React.SetStateAction<typeof initialForm>>;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const inputClass =
    "w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2.5 text-sm placeholder:text-[var(--muted)] " +
    "focus:border-[var(--brass)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]/25";
  const labelClass = "mb-1.5 block text-xs font-medium text-[var(--muted)]";

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add employee"
        className={`fixed z-50 flex flex-col bg-[var(--panel)] shadow-2xl transition-transform duration-300 ease-out
          inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl
          md:inset-y-0 md:left-auto md:right-0 md:top-0 md:h-full md:max-h-full md:w-full md:max-w-[440px] md:rounded-none md:rounded-l-3xl
          ${open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full"}`}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 md:hidden">
          <span className="h-1.5 w-10 rounded-full bg-[var(--line)]" />
        </div>

        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
          <h2 className="font-display text-xl font-semibold">Add Employee</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)]"
          >
            <Icon.Close className="h-5 w-5" />
          </button>
        </div>

        <form id="add-employee-form" onSubmit={onSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className={labelClass} htmlFor="emp-name">Full name</label>
            <input
              id="emp-name"
              placeholder="e.g. Asha Rao"
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="emp-email">Email</label>
            <input
              id="emp-email"
              type="email"
              placeholder="asha@workshop.com"
              required
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="emp-phone">Phone</label>
            <input
              id="emp-phone"
              placeholder="+91 98765 43210"
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="emp-password">Temporary password</label>
            <input
              id="emp-password"
              type="password"
              required
              className={inputClass}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="emp-role">Role</label>
            <select
              id="emp-role"
              className={inputClass}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {form.role === "Employee" && (
            <div>
              <label className={labelClass} htmlFor="emp-dept">Production stage</label>
              <select
                id="emp-dept"
                className={inputClass}
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
        </form>

        <div className="flex gap-3 border-t border-[var(--line)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--line)] py-2.5 text-sm font-medium transition hover:bg-[var(--paper)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-employee-form"
            disabled={submitting}
            className="flex-1 rounded-lg bg-[var(--ink)] py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create Employee"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Delete confirmation
// ─────────────────────────────────────────────────────────────────────────

function ConfirmDialog({
  employee,
  onCancel,
  onConfirm,
}: {
  employee: Employee | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--panel)] p-6 shadow-2xl">
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--danger-soft)]">
          <Icon.Alert className="h-5 w-5 text-[var(--danger)]" />
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold">Delete {employee.name}?</h3>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          This removes them from the roster and unassigns them from any active stage. This can't be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[var(--line)] py-2.5 text-sm font-medium transition hover:bg-[var(--paper)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-[var(--danger)] py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Toasts
// ─────────────────────────────────────────────────────────────────────────

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed inset-x-4 bottom-24 z-50 flex flex-col gap-2 md:inset-x-auto md:bottom-6 md:right-6 md:w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-2.5 rounded-xl border bg-[var(--panel)] px-4 py-3 shadow-lg animate-[toast-in_0.2s_ease-out]"
          style={{ borderColor: t.kind === "success" ? "var(--ok)" : "var(--danger)" }}
        >
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{
              background: t.kind === "success" ? "var(--ok-soft)" : "var(--danger-soft)",
              color: t.kind === "success" ? "var(--ok)" : "var(--danger)",
            }}
          >
            {t.kind === "success" ? <Icon.Check className="h-3 w-3" /> : <Icon.Alert className="h-3 w-3" />}
          </span>
          <p className="text-sm">{t.text}</p>
        </div>
      ))}
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}