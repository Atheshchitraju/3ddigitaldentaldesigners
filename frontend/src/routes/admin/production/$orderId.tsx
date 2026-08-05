import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import API_URL from "../../../config/api";

export const Route = createFileRoute("/admin/production/$orderId")({
  component: ProductionPage,
});

// ─────────────────────────────────────────────────────────────────────────
// Fonts: this file assumes the following are loaded globally (e.g. in
// index.html or a global stylesheet):
//   <link rel="preconnect" href="https://fonts.googleapis.com">
//   <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
// If they aren't loaded, everything gracefully falls back to system fonts.
// ─────────────────────────────────────────────────────────────────────────

const FONT_DISPLAY = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const FONT_BODY = "'Inter', ui-sans-serif, system-ui, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', monospace";

// Visual-only fallback mapping from the order's coarse `status` to a stage
// in the workflow below. Used only for orders that don't yet have
// `production.currentStage` populated (i.e. created before Sprint 2).
const WORKFLOW_STAGES = [
  "Received",
  "Designing",
  "Printing",
  "Metalist",
  "Ceramist",
  "QC",
  "Dispatch",
  "Delivered",
];

const STATUS_TO_STAGE_INDEX: Record<string, number> = {
  Placed: 0,
  Accepted: 0,
  Designing: 1,
  Printing: 2,
  Metalist: 3,
  Ceramist: 4,
  QC: 5,
  Dispatch: 6,
  Completed: 5,
  Delivered: 7,
  Rejected: 0,
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Placed: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  Accepted: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  Designing: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Printing: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Metalist: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Ceramist: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  QC: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  Dispatch: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Delivered: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Rejected: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  Normal: { bg: "bg-slate-100", text: "text-slate-600" },
  High: { bg: "bg-amber-50", text: "text-amber-700" },
  Urgent: { bg: "bg-rose-50", text: "text-rose-700" },
};

function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.Placed;
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusPill({ status }: { status: string }) {
  const s = statusStyle(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${s.bg} ${s.text} px-3 py-1.5 rounded-full text-sm font-medium`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// Compact label/value row used in the Case Details sheet.
function DetailRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[92px_1fr] sm:grid-cols-[120px_1fr] gap-3 py-3 px-1">
      <span
        className="text-[11px] font-medium uppercase tracking-wider text-slate-400 pt-0.5"
        style={{ fontFamily: FONT_BODY }}
      >
        {label}
      </span>
      <span
        className="text-sm sm:text-[15px] font-medium text-slate-900 break-words"
        style={{ fontFamily: mono ? FONT_MONO : FONT_BODY }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-4 rounded-full bg-[#1D5C5A]" />
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1D5C5A]"
          style={{ fontFamily: FONT_BODY }}
        >
          {eyebrow}
        </p>
        {title && (
          <h2 className="text-lg font-semibold text-slate-900 mt-0.5" style={{ fontFamily: FONT_DISPLAY }}>
            {title}
          </h2>
        )}
      </div>
    </div>
  );
}

function EmptyPanel({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="rounded-xl border border-dashed border-slate-200 px-5 py-6 text-center">
        <p className="text-sm text-slate-400" style={{ fontFamily: FONT_BODY }}>
          {note}
        </p>
      </div>
    </div>
  );
}

function TimestampRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-900 mt-0.5" style={{ fontFamily: FONT_MONO }}>
        {formatDateTime(value)}
      </p>
    </div>
  );
}

// ── Generic Stage Assignment Card ───────────────────────────────────────
// Designer/Printing/Metalist/Ceramist/Dispatch assignment cards all follow
// the exact same shape (assign → start → complete). Rather than duplicate
// the whole component per stage, the shared behaviour lives here and each
// stage just supplies its labels, options, and API paths.
function StageAssignmentCard({
  eyebrow,
  title,
  optionLabel,
  options,
  stageData,
  assignPath,
  startPath,
  completePath,
  assignButtonLabel,
  startButtonLabel,
  completeButtonLabel,
  onRefresh,
}: {
  eyebrow: string;
  title: string;
  optionLabel: string;
  options: string[];
  stageData: { assignedTo?: string; assignedAt?: string; startedAt?: string; completedAt?: string };
  assignPath: string;
  startPath: string;
  completePath: string;
  assignButtonLabel: string;
  startButtonLabel: string;
  completeButtonLabel: string;
  onRefresh: () => Promise<void>;
}) {
  const assignedTo = stageData.assignedTo || "";
  const assignedAt = stageData.assignedAt;
  const startedAt = stageData.startedAt;
  const completedAt = stageData.completedAt;

  const [selected, setSelected] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const callAction = async (path: string, body?: Record<string, unknown>) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}${path}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Something went wrong.");
        return;
      }

      setSelected("");
      setSuccess(data.message || "Done.");
      await onRefresh();

      // Clear the success banner after a few seconds so it doesn't linger.
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.log(err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = () => {
    const trimmed = selected.trim();
    if (!trimmed) {
      setError(`Select a ${optionLabel.toLowerCase()}.`);
      return;
    }
    callAction(assignPath, { [optionLabel.toLowerCase()]: trimmed });
  };

  const handleStart = () => callAction(startPath);
  const handleComplete = () => callAction(completePath);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
      <SectionHeading eyebrow={eyebrow} title={title} />

      {!assignedTo ? (
        <div className="space-y-3">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={submitting}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D5C5A]/25 focus:border-[#1D5C5A] disabled:opacity-50"
          >
            <option value="">Select {optionLabel}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={submitting}
            className="w-full bg-[#1D5C5A] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#174A48] transition-colors disabled:opacity-50"
          >
            {submitting ? "Assigning…" : assignButtonLabel}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{optionLabel}</p>
            <p className="text-base font-semibold text-slate-900 mt-1" style={{ fontFamily: FONT_DISPLAY }}>
              {assignedTo}
            </p>
          </div>

          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="pt-3">
              <TimestampRow label="Assigned At" value={assignedAt} />
            </div>
            {startedAt && <TimestampRow label="Started At" value={startedAt} />}
            {completedAt && <TimestampRow label="Completed At" value={completedAt} />}
          </div>

          {!startedAt && (
            <button
              onClick={handleStart}
              disabled={submitting}
              className="w-full bg-[#1D5C5A] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#174A48] transition-colors disabled:opacity-50"
            >
              {submitting ? "Starting…" : startButtonLabel}
            </button>
          )}

          {startedAt && !completedAt && (
            <button
              onClick={handleComplete}
              disabled={submitting}
              className="w-full bg-emerald-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Completing…" : completeButtonLabel}
            </button>
          )}

          {completedAt && (
            <div className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {title} completed
            </div>
          )}
        </div>
      )}

      {success && <p className="text-xs text-emerald-600 mt-3">{success}</p>}
      {error && <p className="text-xs text-rose-600 mt-3">{error}</p>}
    </div>
  );
}

// ── Designer Assignment (live) ─────────────────────────────────────────
function DesignerAssignmentCard({
  order,
  orderId,
  onRefresh,
  employees,
}: {
  order: any;
  orderId: string;
  onRefresh: () => Promise<void>;
  employees: string[];
}) {
  const designerInfo = order.production?.designer ?? {};
  return (
    <StageAssignmentCard
      eyebrow="Assignment"
      title="Designer"
      optionLabel="Designer"
      options={employees}
      stageData={{
        assignedTo: designerInfo.assignedTo || order.designer || "",
        assignedAt: designerInfo.assignedAt,
        startedAt: designerInfo.startedAt,
        completedAt: designerInfo.completedAt,
      }}
      assignPath={`/api/production/${orderId}/designer`}
      startPath={`/api/production/${orderId}/design/start`}
      completePath={`/api/production/${orderId}/design/complete`}
      assignButtonLabel="Assign Designer"
      startButtonLabel="Start Design"
      completeButtonLabel="Complete Design"
      onRefresh={onRefresh}
    />
  );
}

// ── Printing Assignment (live) ──────────────────────────────────────────
function PrintingAssignmentCard({
  order,
  orderId,
  onRefresh,
  employees,
}: {
  order: any;
  orderId: string;
  onRefresh: () => Promise<void>;
  employees: string[];
}) {
  const printingInfo = order.production?.printing ?? {};
  return (
    <StageAssignmentCard
      eyebrow="Assignment"
      title="Printing"
      optionLabel="Printer"
      options={employees}
      stageData={{
        assignedTo: printingInfo.assignedTo || order.printer || "",
        assignedAt: printingInfo.assignedAt,
        startedAt: printingInfo.startedAt,
        completedAt: printingInfo.completedAt,
      }}
      assignPath={`/api/production/${orderId}/printing`}
      startPath={`/api/production/${orderId}/printing/start`}
      completePath={`/api/production/${orderId}/printing/complete`}
      assignButtonLabel="Assign Printer"
      startButtonLabel="Start Printing"
      completeButtonLabel="Complete Printing"
      onRefresh={onRefresh}
    />
  );
}

// ── Metalist Assignment (live) ──────────────────────────────────────────
function MetalistAssignmentCard({
  order,
  orderId,
  onRefresh,
  employees,
}: {
  order: any;
  orderId: string;
  onRefresh: () => Promise<void>;
  employees: string[];
}) {
  const metalInfo = order.production?.metalist ?? {};
  return (
    <StageAssignmentCard
      eyebrow="Assignment"
      title="Metalist"
      optionLabel="Metalist"
      options={employees}
      stageData={{
        assignedTo: metalInfo.assignedTo,
        assignedAt: metalInfo.assignedAt,
        startedAt: metalInfo.startedAt,
        completedAt: metalInfo.completedAt,
      }}
      assignPath={`/api/production/${orderId}/metalist`}
      startPath={`/api/production/${orderId}/metalist/start`}
      completePath={`/api/production/${orderId}/metalist/complete`}
      assignButtonLabel="Assign Metalist"
      startButtonLabel="Start Metal Work"
      completeButtonLabel="Complete Metal Work"
      onRefresh={onRefresh}
    />
  );
}

// ── Ceramist Assignment (live) ──────────────────────────────────────────
function CeramistAssignmentCard({
  order,
  orderId,
  onRefresh,
  employees,
}: {
  order: any;
  orderId: string;
  onRefresh: () => Promise<void>;
  employees: string[];
}) {
  const ceramistInfo = order.production?.ceramist ?? {};
  return (
    <StageAssignmentCard
      eyebrow="Assignment"
      title="Ceramist"
      optionLabel="Ceramist"
      options={employees}
      stageData={{
        assignedTo: ceramistInfo.assignedTo,
        assignedAt: ceramistInfo.assignedAt,
        startedAt: ceramistInfo.startedAt,
        completedAt: ceramistInfo.completedAt,
      }}
      assignPath={`/api/production/${orderId}/ceramist`}
      startPath={`/api/production/${orderId}/ceramist/start`}
      completePath={`/api/production/${orderId}/ceramist/complete`}
      assignButtonLabel="Assign Ceramist"
      startButtonLabel="Start Ceramist Work"
      completeButtonLabel="Complete Ceramist Work"
      onRefresh={onRefresh}
    />
  );
}

// ── QC Assignment (live) ──────────────────────────────────────────
function QCAssignmentCard({
  order,
  orderId,
  onRefresh,
  employees,
}: {
  order: any;
  orderId: string;
  onRefresh: () => Promise<void>;
  employees: string[];
}) {
  const qcInfo = order.production?.qc ?? {};

  return (
    <StageAssignmentCard
      eyebrow="Assignment"
      title="QC"
      optionLabel="QC"
      options={employees}
      stageData={{
        assignedTo: qcInfo.assignedTo,
        assignedAt: qcInfo.assignedAt,
        startedAt: qcInfo.startedAt,
        completedAt: qcInfo.completedAt,
      }}
      assignPath={`/api/production/${orderId}/qc`}
      startPath={`/api/production/${orderId}/qc/start`}
      completePath={`/api/production/${orderId}/qc/complete`}
      assignButtonLabel="Assign QC"
      startButtonLabel="Start QC"
      completeButtonLabel="Complete QC"
      onRefresh={onRefresh}
    />
  );
}

// ── Dispatch Assignment (live) ──────────────────────────────────────────
function DispatchAssignmentCard({
  order,
  orderId,
  onRefresh,
  employees,
}: {
  order: any;
  orderId: string;
  onRefresh: () => Promise<void>;
  employees: string[];
}) {
  const dispatchInfo = order.production?.dispatch ?? {};

  return (
    <StageAssignmentCard
      eyebrow="Assignment"
      title="Dispatch"
      optionLabel="Dispatcher"
      options={employees}
      stageData={{
        assignedTo: dispatchInfo.assignedTo,
        assignedAt: dispatchInfo.assignedAt,
        startedAt: dispatchInfo.startedAt,
        completedAt: dispatchInfo.completedAt,
      }}
      assignPath={`/api/production/${orderId}/dispatch`}
      startPath={`/api/production/${orderId}/dispatch/start`}
      completePath={`/api/production/${orderId}/dispatch/complete`}
      assignButtonLabel="Assign Dispatcher"
      startButtonLabel="Start Dispatch"
      completeButtonLabel="Complete Dispatch"
      onRefresh={onRefresh}
    />
  );
}

// ── Delivered (completion card) ─────────────────────────────────────────
// Not a production stage — a final confirmation step that only unlocks
// once Dispatch has been completed.
function DeliveredCard({
  order,
  orderId,
  onRefresh,
}: {
  order: any;
  orderId: string;
  onRefresh: () => Promise<void>;
}) {
  const dispatchCompleted = order.production?.dispatch?.completedAt;
  const deliveredAt = order.production?.delivery?.deliveredAt;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markDelivered = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}/api/production/${orderId}/delivered`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Something went wrong.");
        return;
      }

      await onRefresh();
    } catch (err) {
      console.log(err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!dispatchCompleted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <SectionHeading eyebrow="Delivery" title="Delivery Confirmation" />
        <div className="rounded-xl border border-dashed border-slate-200 px-5 py-6 text-center">
          <p className="text-sm text-slate-400" style={{ fontFamily: FONT_BODY }}>
            Complete Dispatch before marking this case as delivered.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
      <SectionHeading eyebrow="Delivery" title="Delivery Confirmation" />

      {deliveredAt ? (
        <div className="space-y-5">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Delivered Successfully
          </div>
          <div className="pt-3 border-t border-slate-100">
            <TimestampRow label="Delivered At" value={deliveredAt} />
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Dispatch Completed
          </div>

          <div className="pt-3 border-t border-slate-100">
            <TimestampRow label="Delivered At" value={null} />
          </div>

          <button
            onClick={markDelivered}
            disabled={submitting}
            className="w-full bg-emerald-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Marking…" : "Mark as Delivered"}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-rose-600 mt-3">{error}</p>}
    </div>
  );
}

// ── Activity Log (live) ──────────────────────────────────────────────
function ActivityLogPanel({ order }: { order: any }) {
  const activity: any[] = order.production?.activity ?? [];
  // Newest first
  const items = [...activity].reverse();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
      <SectionHeading eyebrow="History" title="Activity Log" />

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 px-5 py-6 text-center">
          <p className="text-sm text-slate-400">No activity recorded yet.</p>
        </div>
      ) : (
        <div>
          {items.map((entry, index) => (
            <div key={entry._id ?? index} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-2 h-2 rounded-full bg-[#1D5C5A] mt-1.5 shrink-0" />
                {index !== items.length - 1 && <span className="w-px flex-1 bg-slate-200" />}
              </div>
              <div className="pb-5">
                {entry.stage && (
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider text-[#1D5C5A] mb-0.5"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    {entry.stage}
                  </p>
                )}
                <p className="text-sm font-medium text-slate-900">{entry.action}</p>
                {entry.note && <p className="text-xs text-slate-500 mt-0.5">{entry.note}</p>}
                <p className="text-[11px] text-slate-400 mt-1" style={{ fontFamily: FONT_MONO }}>
                  {formatDateTime(entry.createdAt)}
                  {entry.user ? ` · ${entry.user}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductionPage() {
  const navigate = useNavigate();

  const { orderId } = useParams({
    from: "/admin/production/$orderId",
  });

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState({
    designers: [] as string[],
    printers: [] as string[],
    metalists: [] as string[],
    ceramists: [] as string[],
    qc: [] as string[],
    dispatch: [] as string[],
  });

  useEffect(() => {
    fetchOrder();
    fetchEmployees();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("Employees API:", data);

      if (!data.success) return;

      const list = data.employees;

      setEmployees({
        designers: list
          .filter((e: any) => e.department === "Designer")
          .map((e: any) => e.name),

        printers: list
          .filter((e: any) => e.department === "Printer")
          .map((e: any) => e.name),

        metalists: list
          .filter((e: any) => e.department === "Metalist")
          .map((e: any) => e.name),

        ceramists: list
          .filter((e: any) => e.department === "Ceramist")
          .map((e: any) => e.name),

        qc: list
          .filter((e: any) => e.department === "QC")
          .map((e: any) => e.name),

        dispatch: list
          .filter((e: any) => e.department === "Dispatch")
          .map((e: any) => e.name),
      });

      console.log("Employees Loaded");
      console.table(list);

      console.log("Designers");
      console.log(
        list
          .filter((e: any) => e.department === "Designer")
          .map((e: any) => e.name)
      );

    } catch (err) {
      console.log(err);
    }
  };

  // Prefer the granular production.currentStage once an order has it;
  // fall back to the coarse status mapping for older orders that don't.
  const currentStageIndex = (() => {
    if (!order) return 0;
    if (order.production?.currentStage) {
      const index = WORKFLOW_STAGES.indexOf(order.production.currentStage);
      return index >= 0 ? index : 0;
    }
    return STATUS_TO_STAGE_INDEX[order.status] ?? 0;
  })();

  return (
    <div className="min-h-screen bg-[#FAFAF8]" style={{ fontFamily: FONT_BODY }}>
      {/* Clearance so this page's header sits below the site navbar instead of under/behind it */}
      <div className="h-20 sm:h-24" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => navigate({ to: "/admin/orders" })}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span aria-hidden="true">←</span> Back to Orders
        </button>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-14 text-center">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-slate-200 border-t-[#1D5C5A] animate-spin" />
            <h2 className="text-lg font-semibold mt-5 text-slate-900" style={{ fontFamily: FONT_DISPLAY }}>
              Loading production case
            </h2>
            <p className="text-sm text-slate-400 mt-1">Fetching order details…</p>
          </div>
        ) : !order ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center">
            <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: FONT_DISPLAY }}>
              Order not found
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Check the order ID, or go back and select a case from the list.
            </p>
          </div>
        ) : (
          <>
            {/* ── Header ───────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 pb-6 mb-6 border-b border-slate-200">
              <div>
                <p
                  className="text-xs font-medium tracking-wider text-slate-400 mb-1"
                  style={{ fontFamily: FONT_MONO }}
                >
                  CASE #{order.orderId}
                </p>
                <h1
                  className="text-[28px] sm:text-4xl font-semibold text-slate-900 leading-tight"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  Production Management
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  {order.name || "Unassigned doctor"}
                  {order.clinic ? ` · ${order.clinic}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={order.status} />
                <span className="inline-flex items-center bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  {order.product}
                </span>
              </div>
            </div>

            {/* ── Quick Statistics strip ───────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 mb-6 overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 divide-y divide-slate-100 sm:divide-y-0 sm:divide-x sm:divide-slate-100">
                {[
                  { label: "Status", value: order.status },
                  { label: "Designer", value: order.production?.designer?.assignedTo || order.designer || "Not assigned" },
                  { label: "Printer", value: order.production?.printing?.assignedTo || order.printer || "Not assigned" },
                  { label: "Metalist", value: order.production?.metalist?.assignedTo || "Not assigned" },
                  { label: "Ceramist", value: order.production?.ceramist?.assignedTo || "Not assigned" },
                  { label: "QC", value: order.production?.qc?.assignedTo || "Not assigned" },
                  { label: "Dispatcher", value: order.production?.dispatch?.assignedTo || "Not assigned" },
                  {
                    label: "Ordered",
                    value: order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                      })
                      : "—",
                  },
                  { label: "Priority", value: order.priority || "Normal" },
                ].map((stat) => (
                  <div key={stat.label} className="px-5 py-4">
                    <p
                      className="text-[11px] font-medium uppercase tracking-wider text-slate-400"
                      style={{ fontFamily: FONT_BODY }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className="text-base sm:text-lg font-semibold text-slate-900 mt-1 truncate"
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Production Timeline ──────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6">
              <SectionHeading eyebrow="Workflow" title="Production Timeline" />

              {/* Desktop / tablet: horizontal stepper */}
              <div className="hidden sm:flex items-start">
                {WORKFLOW_STAGES.map((stage, index) => {
                  const isComplete = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const isLast = index === WORKFLOW_STAGES.length - 1;

                  return (
                    <div key={stage} className="flex items-start flex-1 last:flex-none">
                      <div className="flex flex-col items-center w-20 shrink-0">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${isComplete
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                              ? "bg-[#1D5C5A] text-white"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}
                        >
                          {isComplete ? "✓" : index + 1}
                        </span>
                        <span
                          className={`text-xs font-medium mt-2 text-center leading-tight ${isCurrent ? "text-[#1D5C5A]" : isComplete ? "text-slate-700" : "text-slate-400"
                            }`}
                        >
                          {stage}
                        </span>
                      </div>

                      {!isLast && (
                        <div
                          className={`flex-1 h-0.5 mt-4 rounded-full ${isComplete ? "bg-emerald-400" : "bg-slate-200"
                            }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile: vertical stepper */}
              <div className="flex sm:hidden flex-col">
                {WORKFLOW_STAGES.map((stage, index) => {
                  const isComplete = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const isLast = index === WORKFLOW_STAGES.length - 1;

                  return (
                    <div key={stage} className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${isComplete
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                              ? "bg-[#1D5C5A] text-white"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}
                        >
                          {isComplete ? "✓" : index + 1}
                        </span>
                        <span
                          className={`text-sm font-medium ${isCurrent ? "text-[#1D5C5A]" : isComplete ? "text-slate-900" : "text-slate-400"
                            }`}
                        >
                          {stage}
                        </span>
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 h-6 ml-[13px] rounded-full ${isComplete ? "bg-emerald-400" : "bg-slate-200"
                            }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100">
                Each production stage records its assigned employee and start/completion timestamps.
              </p>
            </div>

            {/* ── Case Details ──────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6">
              <SectionHeading eyebrow="Case File" title="Patient & Case Details" />
              <div className="divide-y divide-slate-100">
                <DetailRow label="Doctor" value={order.name} />
                <DetailRow label="Patient" value={order.patientName} />
                <DetailRow label="Age" value={order.patientAge} />
                <DetailRow label="Clinic" value={order.clinic} />
                <DetailRow label="Product" value={order.product} />
                <DetailRow label="Shade" value={order.shade} mono />
                <DetailRow
                  label="Teeth"
                  value={Array.isArray(order.selectedTeeth) ? order.selectedTeeth.join(", ") : "-"}
                  mono
                />
                <DetailRow
                  label="Designer"
                  value={order.production?.designer?.assignedTo || order.designer || "Not assigned"}
                />
                <DetailRow
                  label="Printer"
                  value={order.production?.printing?.assignedTo || order.printer || "Not assigned"}
                />
                <DetailRow
                  label="Metalist"
                  value={order.production?.metalist?.assignedTo || "Not assigned"}
                />
                <DetailRow
                  label="Ceramist"
                  value={order.production?.ceramist?.assignedTo || "Not assigned"}
                />
                <DetailRow
                  label="QC"
                  value={order.production?.qc?.assignedTo || "Not assigned"}
                />
                <DetailRow
                  label="Dispatcher"
                  value={order.production?.dispatch?.assignedTo || "Not assigned"}
                />
              </div>
            </div>

            {/* ── Stage Assignment Cards ───────────────────────────── */}
            <div className="grid lg:grid-cols-6 gap-6 mb-6">
              <DesignerAssignmentCard order={order} orderId={orderId} onRefresh={fetchOrder} employees={employees.designers} />
              <PrintingAssignmentCard order={order} orderId={orderId} onRefresh={fetchOrder} employees={employees.printers} />
              <MetalistAssignmentCard order={order} orderId={orderId} onRefresh={fetchOrder} employees={employees.metalists} />
              <CeramistAssignmentCard order={order} orderId={orderId} onRefresh={fetchOrder} employees={employees.ceramists} />
              <QCAssignmentCard order={order} orderId={orderId} onRefresh={fetchOrder} employees={employees.qc} />
              <DispatchAssignmentCard order={order} orderId={orderId} onRefresh={fetchOrder} employees={employees.dispatch} />
            </div>

            {/* ── Delivery Confirmation ─────────────────────────────── */}
            {/* Not a production stage — a final confirmation step, kept visually
                separate from the manufacturing assignment cards above. */}
            <div className="mb-6">
              <DeliveredCard order={order} orderId={orderId} onRefresh={fetchOrder} />
            </div>

            {/* ── Internal Notes + Activity Log ────────────────────── */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <EmptyPanel
                eyebrow="Private"
                title="Internal Notes"
                note="Private notes for the production team, not visible to the clinic — coming soon."
              />
              <ActivityLogPanel order={order} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductionPage;