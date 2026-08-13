import { useCallback, useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import API_URL from "@/config/api";

export const Route = createFileRoute("/track-order/$orderId")({
    component: OrderTrackingPage,
});

type StageKey =
    | "Received"
    | "Designing"
    | "Printing"
    | "Metalist"
    | "Ceramist"
    | "QC"
    | "Dispatch"
    | "Delivered";

const STAGES: {
    key: StageKey;
    title: string;
    description: string;
}[] = [
        {
            key: "Received",
            title: "Order Received",
            description: "Your order has been received successfully.",
        },
        {
            key: "Designing",
            title: "Designing",
            description: "Your dental case is being designed.",
        },
        {
            key: "Printing",
            title: "Printing",
            description: "Your case is currently being printed.",
        },
        {
            key: "Metalist",
            title: "Metalist",
            description: "Your case is being processed by the metalist.",
        },
        {
            key: "Ceramist",
            title: "Ceramist",
            description: "Your case is being finished by the ceramist.",
        },
        {
            key: "QC",
            title: "Quality Check",
            description: "Your case is undergoing final quality inspection.",
        },
        {
            key: "Dispatch",
            title: "Dispatch",
            description: "Your completed case is being prepared for dispatch.",
        },
        {
            key: "Delivered",
            title: "Delivered",
            description: "Your order has been delivered successfully.",
        },
    ];

/* ---------- small inline icons (no extra deps) ---------- */

const IconHome = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
            d="M4 11.5 12 4l8 7.5M6 9.5V19a1 1 0 0 0 1 1h3.5v-5.5h3V20H17a1 1 0 0 0 1-1V9.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const IconRefresh = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
            d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18.5 3.5v4h-4M5.5 20.5v-4h4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const IconHelp = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.8"
        />
        <path
            d="M9.5 9.3a2.5 2.5 0 1 1 3.7 2.2c-.8.5-1.2.9-1.2 1.9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="12" cy="16.7" r="1" fill="currentColor" />
    </svg>
);

const IconShare = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
            d="M7 12.5 16.5 7M7 11.5 16.5 17M18 6.5a2 2 0 1 0 0-.1ZM6 12.5a2 2 0 1 0 0-.1ZM18 19.5a2 2 0 1 0 0-.1Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const IconBack = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
            d="M15 5 8 12l7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/* ---------------------------------------------------------- */

function OrderTrackingPage() {
    const { orderId } = useParams({
        from: "/track-order/$orderId",
    });

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            setError("");

            const response = await fetch(
                `${API_URL}/api/orders/${encodeURIComponent(orderId)}`
            );

            const data = await response.json();

            if (!response.ok || !data.success || !data.order) {
                throw new Error(data.message || "Order not found");
            }

            setOrder(data.order);
        } catch (err) {
            console.error("Order tracking error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load order details."
            );
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    // Initial load
    useEffect(() => {
        setLoading(true);
        fetchOrder();
    }, [fetchOrder]);

    // Automatically check for status changes every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchOrder();
        }, 15000);

        return () => clearInterval(interval);
    }, [fetchOrder]);

    const handleShare = async () => {
        const url = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Order Tracking",
                    url,
                });
                return;
            }

            await navigator.clipboard.writeText(url);
            setCopied(true);

            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* user cancelled share / clipboard unavailable — ignore */
        }
    };

    const goHome = () => {
        window.location.href = "/";
    };

    /* ---------------- Top nav (shared across states) ---------------- */

    const TopNav = () => (
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
                <button
                    onClick={goHome}
                    aria-label="Back to home"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 active:scale-95"
                >
                    <IconBack className="h-5 w-5" />
                </button>

                <div className="text-center">
                    <br></br>
                    <br></br>
                    <br></br>

                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                        3D Digital Dental Designers
                    </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                </div>
            </div>
        </header>
    );

    /* ---------------- Bottom nav / action bar ---------------- */

    const BottomNav = () => (
        <nav className="border-t border-gray-100 bg-white [padding-bottom:env(safe-area-inset-bottom)]">
            <div className="mx-auto flex max-w-3xl items-stretch justify-between px-2 sm:px-6">
                {[
                    {
                        label: "Home",
                        icon: IconHome,
                        onClick: goHome,
                    },
                    {
                        label: "Refresh",
                        icon: IconRefresh,
                        onClick: fetchOrder,
                    },
                    {
                        label: copied ? "Copied!" : "Share",
                        icon: IconShare,
                        onClick: handleShare,
                    },
                    {
                        label: "Help",
                        icon: IconHelp,
                        onClick: () =>
                        (window.location.href =
                            "mailto:support@3ddds.example"),
                    },
                ].map(({ label, icon: Icon, onClick }) => (
                    <button
                        key={label}
                        onClick={onClick}
                        className="flex flex-1 flex-col items-center gap-1 py-2.5 text-gray-500 transition active:scale-95 sm:flex-none sm:px-8"
                    >
                        <Icon className="h-5 w-5" />
                        <span className="text-[11px] font-medium">
                            {label}
                        </span>
                    </button>
                ))}
            </div>
        </nav>
    );

    /* ---------------- Loading state ---------------- */

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-gray-50">
                <TopNav />

                <div className="flex flex-1 items-center justify-center px-6">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

                        <p className="text-gray-500">
                            Loading order tracking...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /* ---------------- Error state ---------------- */

    if (error || !order) {
        return (
            <div className="flex min-h-screen flex-col bg-gray-50">
                <TopNav />

                <div className="flex flex-1 items-center justify-center px-6">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
                            !
                        </div>

                        <h1 className="mt-5 text-2xl font-bold text-gray-900">
                            Order Not Found
                        </h1>

                        <p className="mt-2 text-gray-500">
                            {error || "Unable to find this order."}
                        </p>

                        <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                            Order ID: {orderId}
                        </p>
                    </div>
                </div>

                <BottomNav />
            </div>
        );
    }

    const currentStage: StageKey =
        order.production?.currentStage || "Received";

    const currentIndex = Math.max(
        0,
        STAGES.findIndex((stage) => stage.key === currentStage)
    );

    const progressPct =
        (currentIndex / (STAGES.length - 1)) * 100;

    /*
     * ----------------------------------------------------------
     * DELIVERY LOGIC
     * ----------------------------------------------------------
     *
     * An order is considered delivered when ANY of these are true:
     *
     * 1. production.currentStage === "Delivered"
     * 2. order.status === "Delivered"
     * 3. production.delivery.deliveredAt exists
     *
     * Once delivered:
     * - Every stage is complete
     * - No stage is current
     * - Existing UI logic continues to work
     */
    const isDelivered =
        order.production?.currentStage === "Delivered" ||
        order.status === "Delivered" ||
        !!order.production?.delivery?.deliveredAt;

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <TopNav />

            <main className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    {/* Hero status card */}
                    <div className="overflow-hidden rounded-3xl bg-gray-900 text-white shadow-lg shadow-gray-900/10">
                        <div className="flex items-center justify-between px-6 pt-6">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
                                    Order ID
                                </p>

                                <p className="mt-1 font-mono text-sm font-semibold text-white">
                                    {order.orderId}
                                </p>
                            </div>

                            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Live
                            </span>
                        </div>

                        <div className="px-6 pb-6 pt-5">
                            <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
                                Current Status
                            </p>

                            <h2 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
                                {isDelivered
                                    ? "Delivered"
                                    : STAGES[currentIndex]?.title ||
                                    "Order Received"}
                            </h2>

                            <p className="mt-1.5 text-sm text-gray-300">
                                {isDelivered
                                    ? "Your order has been delivered successfully."
                                    : STAGES[currentIndex]?.description}
                            </p>

                            {/* mini progress bar */}
                            <div className="mt-5">
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                                    <div
                                        className="h-full rounded-full bg-emerald-400 transition-all duration-700 ease-out"
                                        style={{
                                            width: isDelivered
                                                ? "100%"
                                                : `${Math.max(
                                                    progressPct,
                                                    4
                                                )}%`,
                                        }}
                                    />
                                </div>

                                <div className="mt-2 flex justify-between text-[11px] font-medium text-gray-400">
                                    <span>Received</span>
                                    <span>Delivered</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order info */}
                    <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                    Patient
                                </p>

                                <p className="mt-1 font-semibold text-gray-900">
                                    {order.patientName || "N/A"}
                                </p>
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                    Product
                                </p>

                                <p className="mt-1 font-semibold text-gray-900">
                                    {order.product || "N/A"}
                                </p>
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                    Shade
                                </p>

                                <p className="mt-1 font-semibold text-gray-900">
                                    {order.shade || "Not selected"}
                                </p>
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                    Clinic
                                </p>

                                <p className="mt-1 font-semibold text-gray-900">
                                    {order.clinic || "N/A"}
                                </p>
                            </div>

                            {order.deliveryDate && (
                                <div className="col-span-2 rounded-2xl bg-gray-50 px-4 py-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                        Estimated Delivery
                                    </p>

                                    <p className="mt-0.5 font-semibold text-gray-900">
                                        {order.deliveryDate}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress timeline */}
                    <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Production Progress
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-400">
                                Status updates automatically.
                            </p>
                        </div>

                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gray-200" />

                            <div
                                className="absolute left-[15px] top-4 w-px bg-gray-900 transition-all duration-700 ease-out"
                                style={{
                                    height: isDelivered
                                        ? "calc(100% - 32px)"
                                        : `calc(${(currentIndex /
                                            (STAGES.length - 1)) *
                                        100
                                        }% - ${currentIndex ===
                                            STAGES.length - 1
                                            ? "32px"
                                            : "0px"
                                        })`,
                                }}
                            />

                            <div className="space-y-7">
                                {STAGES.map((stage, index) => {
                                    /*
                                     * Requested delivery logic.
                                     *
                                     * When delivered:
                                     * - isComplete = true for every stage
                                     * - isCurrent = false for every stage
                                     *
                                     * Otherwise the original stage-index
                                     * behavior remains unchanged.
                                     */
                                    const isComplete = isDelivered
                                        ? true
                                        : index < currentIndex;

                                    const isCurrent = isDelivered
                                        ? false
                                        : index === currentIndex;

                                    const isLast =
                                        index === STAGES.length - 1;

                                    return (
                                        <div
                                            key={stage.key}
                                            className="relative flex items-start gap-4"
                                        >
                                            {/* Status Circle */}
                                            <div
                                                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${isComplete
                                                        ? "border-gray-900 bg-gray-900 text-white"
                                                        : isCurrent
                                                            ? "border-gray-900 bg-white text-gray-900 shadow-[0_0_0_4px_rgba(0,0,0,0.06)]"
                                                            : "border-gray-200 bg-white text-gray-300"
                                                    }`}
                                            >
                                                {isComplete ? (
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        className="h-4 w-4"
                                                    >
                                                        <path
                                                            d="M5 12.5 9.5 17 19 7.5"
                                                            stroke="currentColor"
                                                            strokeWidth="2.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pb-0.5">
                                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                    <h3
                                                        className={`font-semibold ${!isComplete &&
                                                                !isCurrent
                                                                ? "text-gray-300"
                                                                : "text-gray-900"
                                                            }`}
                                                    >
                                                        {stage.title}
                                                    </h3>

                                                    {isCurrent && (
                                                        <span className="flex w-fit items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                                                            In Progress
                                                        </span>
                                                    )}

                                                    {isComplete && (
                                                        <span className="text-xs font-medium text-gray-400">
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>

                                                <p
                                                    className={`mt-1 text-sm ${!isComplete &&
                                                            !isCurrent
                                                            ? "text-gray-300"
                                                            : "text-gray-500"
                                                        }`}
                                                >
                                                    {stage.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <p className="mt-5 text-center text-xs text-gray-400">
                        Status automatically refreshes every 15 seconds.
                    </p>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}