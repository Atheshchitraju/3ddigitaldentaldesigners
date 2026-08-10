import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import API_URL from "../../config/api";

/**
 * Fonts used by this page — add once to your index.html <head>:
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
 */

export const Route = createFileRoute("/employee/dashboard")({
  component: EmployeeDashboard,
});

// Stage-transition config — the single source of truth for what
// department comes next after a given employee's stage, and how to
// call the assignment API for that next stage. Add a new stage here
// and every handoff in the dashboard picks it up automatically.
const WORKFLOW: Record<
  string,
  {
    nextDepartment: string | null;
    assignApi: string | null;
    assignField: string | null;
  }
> = {
  Designer: {
    nextDepartment: "Printer",
    assignApi: "printing",
    assignField: "printer",
  },

  Printer: {
    nextDepartment: "Metalist",
    assignApi: "metalist",
    assignField: "metalist",
  },

  Metalist: {
    nextDepartment: "Ceramist",
    assignApi: "ceramist",
    assignField: "ceramist",
  },

  Ceramist: {
    nextDepartment: "QC",
    assignApi: "qc",
    assignField: "qc",
  },

  QC: {
    nextDepartment: "Dispatch",
    assignApi: "dispatch",
    assignField: "dispatcher",
  },

  Dispatch: {
    nextDepartment: null,
    assignApi: null,
    assignField: null,
  },
};

// Design tokens — keep every color decision here, nowhere else.
const COLOR = {
  primary: "#154D4B", // deep teal, brand anchor
  primaryLight: "#2F8F86", // bright teal, active/accent
  canvas: "#F6F4EF", // warm porcelain background
  ink: "#16231F", // primary text
  slate: "#6B7A78", // muted text
  gold: "#C08A3E", // lab-gold accent, status
  line: "#E4E1D8", // hairline borders on porcelain
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "good" | "neutral" | "warn";
}) {
  const styles =
    tone === "good"
      ? { bg: "#E4F1EE", fg: COLOR.primary }
      : tone === "warn"
        ? { bg: "#F6EADB", fg: COLOR.gold }
        : { bg: "#EDEBE3", fg: COLOR.slate };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
      style={{ backgroundColor: styles.bg, color: styles.fg }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: styles.fg }}
      />
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl bg-white p-5 sm:p-6"
      style={{ border: `1px solid ${COLOR.line}` }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "#E4F1EE", color: COLOR.primary }}
      >
        {icon}
      </div>
      <div>
        <p
          className="text-sm"
          style={{ color: COLOR.slate, fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          {label}
        </p>
        <h3
          className="mt-0.5 text-2xl font-semibold"
          style={{ color: COLOR.ink, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {value}
        </h3>
      </div>
    </div>
  );
}

// A small "specimen tag" chip — the one signature element on the page.
// Styled like a lab work-order tag: mono label, notched corner, hairline rule.
function SpecimenTag({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="relative min-w-[9.5rem] flex-1 rounded-xl bg-white px-4 py-3"
      style={{ border: `1px solid ${COLOR.line}` }}
    >
      <span
        className="absolute right-0 top-0 h-3 w-3 rounded-bl-xl"
        style={{ backgroundColor: COLOR.canvas, borderLeft: `1px solid ${COLOR.line}`, borderBottom: `1px solid ${COLOR.line}` }}
      />
      <p
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: COLOR.slate, fontFamily: "'IBM Plex Sans', sans-serif" }}
      >
        {label}
      </p>
      <p
        className="mt-1 truncate text-base font-semibold"
        style={{ color: COLOR.ink, fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {value}
      </p>
    </div>
  );
}

function TimelineRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="flex justify-between border-b py-2 text-sm">
      <span className="text-gray-500">{label}</span>

      <span className="font-medium">
        {value
          ? new Date(value).toLocaleString()
          : "--"}
      </span>
    </div>
  );
}

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<any>(null);

  const [statistics, setStatistics] = useState({
    total: 0,
    new: 0,
    pending: 0,
    completed: 0,
  });

  const [orders, setOrders] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Next-stage assignment (populated after a design is completed,
  // so the designer can hand the case off to a printer).
  const [nextEmployees, setNextEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("employeeToken") ||
      sessionStorage.getItem("employeeToken");

    if (!token) {
      navigate({ to: "/employee/login" });
      return;
    }

    fetchEmployee(token);
  }, []);

  const fetchEmployee = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/employee/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        localStorage.removeItem("employeeToken");
        localStorage.removeItem("employee");

        navigate({ to: "/employee/login" });
        return;
      }

      setEmployee(data.employee);

      setStatistics(data.statistics);

      setOrders(data.orders);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  // Loads the pool of employees in a given department so the current
  // employee can hand a case off to the next stage (e.g. "Printer").
  const fetchNextEmployees = async (department: string) => {
    try {
      setLoadingEmployees(true);

      const token = localStorage.getItem("employeeToken");

      const res = await fetch(
        `${API_URL}/api/employees?department=${department}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log("Department:", department);
      console.log("Employees API Response:", data);

      if (data.success) {
        setNextEmployees(data.employees);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employee");

    sessionStorage.removeItem("employeeToken");
    sessionStorage.removeItem("employee");

    navigate({ to: "/employee/login" });
  };

  const updateOrder = async (
    orderId: string,
    action: "start" | "complete"
  ) => {

    console.log("Sending Order ID:", orderId);

    const token = localStorage.getItem("employeeToken");

    const stageMap: Record<string, string> = {
      Designer: "design",
      Printer: "printing",
      Metalist: "metalist",
      Ceramist: "ceramist",
      QC: "qc",
      Dispatch: "dispatch",
    };

    const stage = stageMap[employee.department];

    const endpoint =
      action === "start"
        ? `/api/production/${orderId}/${stage}/start`
        : `/api/production/${orderId}/${stage}/complete`;

    try {

      const response = await fetch(
        API_URL + endpoint,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      // Work just finished — look up whatever stage comes after this
      // employee's own department and load that pool, so the handoff
      // works the same way for every stage without hardcoding it here.
      if (action === "complete") {
        const flow = WORKFLOW[employee.department];

        if (flow?.nextDepartment) {
          await fetchNextEmployees(flow.nextDepartment);
        }
      }

      fetchEmployee(token!);

    } catch (err) {

      console.log(err);

      alert("Something went wrong.");

    }

  };

  const assignNextEmployee = async (
    orderId: string,
    department: string
  ) => {
    if (!selectedEmployee) {
      alert(`Please select a ${department}`);
      return;
    }

    try {
      const token = localStorage.getItem("employeeToken");

      const flow = WORKFLOW[employee.department];

      if (!flow) {
        alert("Workflow not found");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/production/${orderId}/${flow.assignApi}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            [flow.assignField!]: selectedEmployee,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert(`${department} assigned successfully`);

      setSelectedEmployee("");
      setNextEmployees([]);

      fetchEmployee(token!);

    } catch (err) {
      console.log(err);
      alert("Assignment failed");
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: COLOR.canvas }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-[3px] border-t-transparent"
            style={{ borderColor: COLOR.primaryLight, borderTopColor: "transparent" }}
          />
          <p
            className="text-sm"
            style={{ color: COLOR.slate, fontFamily: "'IBM Plex Sans', sans-serif" }}
          >
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-16"
      style={{ backgroundColor: COLOR.canvas, fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      {/* Header — sits below your global site navbar, so no sticky/overlap here.
          Adjust pt-16 below if your global navbar's height is different. */}
      <header
        className="px-4 py-4 sm:px-6 lg:px-10"
        style={{ backgroundColor: COLOR.primary }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: COLOR.primaryLight, fontFamily: "'Sora', sans-serif" }}
            >
              D³
            </div>
            <div>
              <h1
                className="text-lg font-semibold leading-tight text-white sm:text-xl"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Employee Dashboard
              </h1>
              <p className="text-xs text-white/70 sm:text-sm">
                Digital Dental Designers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="hidden h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white sm:flex"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", fontFamily: "'Sora', sans-serif" }}
            >
              {initials(employee.name)}
            </div>
            <button
              onClick={logout}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        {/* Welcome + specimen tags */}
        <section
          className="rounded-2xl bg-white p-6 sm:p-8"
          style={{ border: `1px solid ${COLOR.line}` }}
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: COLOR.primaryLight }}
              >
                {greeting()}
              </p>
              <h2
                className="mt-1 text-2xl font-semibold sm:text-3xl"
                style={{ color: COLOR.ink, fontFamily: "'Sora', sans-serif" }}
              >
                {employee.name}
              </h2>
              <p className="mt-2 text-sm" style={{ color: COLOR.slate }}>
                Here's what's on your workbench today.
              </p>
            </div>
          </div>

          {/* Specimen tag row — signature element */}
          <div className="mt-6 flex flex-wrap gap-3">
            <SpecimenTag label="Employee ID" value={employee.employeeId} />
            <SpecimenTag label="Department" value={employee.department} />
            <SpecimenTag label="Working Status" value={employee.workingStatus} />
            <SpecimenTag label="Account Status" value={employee.status} />
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Pending orders"
            value={statistics.new}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            }
          />
          <StatCard
            label="Working orders"
            value={statistics.pending}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
            }
          />
          <StatCard
            label="Completed today"
            value={statistics.completed}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            }
          />
        </section>

        {/* Orders */}
        <section
          className="mt-8 rounded-2xl bg-white p-6 sm:p-8"
          style={{ border: `1px solid ${COLOR.line}` }}
        >
          <div className="flex items-center justify-between">
            <h2
              className="text-lg font-semibold sm:text-xl"
              style={{ color: COLOR.ink, fontFamily: "'Sora', sans-serif" }}
            >
              My assigned orders
            </h2>
            <StatusBadge
              label={`${statistics.total} Active`}
              tone="good"
            />
          </div>

          {orders.length === 0 ? (
            <div
              className="mt-6 flex flex-col items-center justify-center gap-3 rounded-xl px-6 py-14 text-center"
              style={{
                backgroundColor: COLOR.canvas,
                border: `1px dashed ${COLOR.line}`,
              }}
            >
              <p
                className="font-medium"
                style={{ color: COLOR.ink }}
              >
                No orders assigned yet
              </p>

              <p
                className="text-sm"
                style={{ color: COLOR.slate }}
              >
                New cases assigned by admin will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {orders.map((order: any) => {

                const flow = WORKFLOW[employee.department];

                const stageKeyMap: Record<string, string> = {
                  Designer: "designer",
                  Printer: "printing",
                  Metalist: "metalist",
                  Ceramist: "ceramist",
                  QC: "qc",
                  Dispatch: "dispatch",
                };

                const stage = order.production?.[
                  stageKeyMap[employee.department]
                ] || {};

                const previousStageMap: Record<string, string | null> = {
                  Designer: null,
                  Printer: "designer",
                  Metalist: "printing",
                  Ceramist: "metalist",
                  QC: "ceramist",
                  Dispatch: "qc",
                };

                const previousStage =
                  previousStageMap[employee.department]
                    ? order.production?.[
                    previousStageMap[employee.department]!
                    ]
                    : null;

                const nextStageKeyMap: Record<string, string | null> = {
                  Designer: "printing",
                  Printer: "metalist",
                  Metalist: "ceramist",
                  Ceramist: "qc",
                  QC: "dispatch",
                  Dispatch: null,
                };

                const nextStage =
                  nextStageKeyMap[employee.department]
                    ? order.production?.[
                    nextStageKeyMap[employee.department]!
                    ]
                    : null;

                return (
                  <div
                    key={order._id}
                    className="rounded-xl border bg-white p-5"
                    style={{ borderColor: COLOR.line }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: COLOR.ink }}>
                          {order.patientName}
                        </h3>

                        <p className="text-sm" style={{ color: COLOR.slate }}>
                          {order.clinic}
                        </p>
                      </div>

                      <StatusBadge
                        label={order.status}
                        tone="good"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-5">
                      <SpecimenTag
                        label="Order ID"
                        value={order.orderId}
                      />

                      <SpecimenTag
                        label="Product"
                        value={order.product}
                      />

                      <SpecimenTag
                        label="Shade"
                        value={order.shade || "-"}
                      />

                      <SpecimenTag
                        label="Quantity"
                        value={String(order.quantity)}
                      />
                    </div>

                    {/* Previous Stage */}

                    {previousStage && (
                      <div className="mt-6 rounded-xl border bg-gray-50 p-4">

                        <h4 className="font-semibold mb-3">
                          Previous Stage
                        </h4>

                        <TimelineRow
                          label="Assigned At"
                          value={previousStage.assignedAt}
                        />

                        <TimelineRow
                          label="Started At"
                          value={previousStage.startedAt}
                        />

                        <TimelineRow
                          label="Completed At"
                          value={previousStage.completedAt}
                        />

                      </div>
                    )}

                    <div className="mt-5 rounded-xl border p-4">

                      <h4 className="font-semibold mb-3">
                        {employee.department}
                      </h4>

                      <TimelineRow
                        label="Assigned At"
                        value={stage.assignedAt}
                      />

                      <TimelineRow
                        label="Started At"
                        value={stage.startedAt}
                      />

                      <TimelineRow
                        label="Completed At"
                        value={stage.completedAt}
                      />

                    </div>

                    <div className="mt-6 flex gap-3">
                      {!stage.startedAt && (
                        <button
                          onClick={() =>
                            updateOrder(order.orderId, "start")
                          }
                          className="rounded-lg bg-blue-600 px-5 py-2 text-white"
                        >
                          Start {employee.department}
                        </button>
                      )}

                      {stage.startedAt &&
                        !stage.completedAt && (
                          <button
                            onClick={() =>
                              updateOrder(order.orderId, "complete")
                            }
                            className="rounded-lg bg-green-600 px-5 py-2 text-white"
                          >
                            Complete {employee.department}
                          </button>
                        )}
                    </div>

                    {stage.completedAt &&
                      flow.nextDepartment &&
                      !nextStage?.assignedTo && (
                        <div className="mt-5 space-y-3">

                          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                            <p className="font-semibold text-green-700">
                              ✓ {employee.department} Completed
                            </p>
                          </div>

                          <select
                            value={selectedEmployee}
                            onChange={(e) =>
                              setSelectedEmployee(e.target.value)
                            }
                            className="w-full rounded-lg border p-2"
                          >
                            <option value="">
                              Select {flow.nextDepartment}
                            </option>

                            {nextEmployees.map((emp: any) => (
                              <option
                                key={emp._id}
                                value={emp.name}
                              >
                                {emp.name}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() =>
                              assignNextEmployee(
                                order.orderId,
                                flow.nextDepartment!
                              )
                            }
                            className="rounded-lg bg-indigo-600 px-5 py-2 text-white"
                          >
                            Assign {flow.nextDepartment}
                          </button>

                        </div>
                      )}

                    {nextStage?.assignedTo && (
                      <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">

                        <p className="text-sm font-semibold text-green-700">
                          ✓ {flow.nextDepartment} Assigned
                        </p>

                        <p className="mt-2 text-lg font-semibold">
                          {nextStage.assignedTo}
                        </p>

                        <TimelineRow
                          label="Assigned At"
                          value={nextStage.assignedAt}
                        />

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default EmployeeDashboard;