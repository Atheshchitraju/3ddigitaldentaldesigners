import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import logo from "../assets/3D.webp";

export const Route = createFileRoute("/book-scanner")({
  component: BookScanner,
});

/* ------------------------------------------------------------------ */
/*  Design tokens (kept in one place so the whole page stays coherent) */
/* ------------------------------------------------------------------ */

const FONT_LINK_ID = "bsd-font-import";
const COLORS = {
  ink: "#0B1220", // near-black navy — headings, primary text
  slate: "#475467", // secondary text
  paper: "#F6F7F9", // page background
  line: "#E4E7EC", // hairline borders
  teal: "#0F6E6E", // primary brand accent (precision / medical)
  tealDark: "#0B5454",
  available: "#12805C",
  availableBg: "#ECFBF3",
  booked: "#B42318",
  bookedBg: "#FEF3F2",
  queue: "#B54708",
  queueBg: "#FFFAEB",
  info: "#175CD3",
  infoBg: "#EFF8FF",
};

function useInjectFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Minimal inline icon set (no external icon dependency, zero risk    */
/*  of a missing-package build break)                                  */
/* ------------------------------------------------------------------ */

const iconBase = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" } as const;

function IconPin({ className = "" }: { className?: string }) {
  return (
    <svg {...iconBase} className={className}>
      <path
        d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IconClock({ className = "" }: { className?: string }) {
  return (
    <svg {...iconBase} className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconBattery({ className = "", level = 100 }: { className?: string; level?: number }) {
  const w = Math.max(2, Math.round((level / 100) * 16));
  return (
    <svg {...iconBase} className={className}>
      <rect x="2" y="8" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="21" y="10.5" width="1.6" height="3" rx="0.8" fill="currentColor" />
      <rect x="4" y="10" width={w} height="4" rx="1" fill="currentColor" />
    </svg>
  );
}
function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg {...iconBase} className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconAlert({ className = "" }: { className?: string }) {
  return (
    <svg {...iconBase} className={className}>
      <path
        d="M12 3.5 21.5 20h-19L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" />
    </svg>
  );
}
function IconPhone({ className = "" }: { className?: string }) {
  return (
    <svg {...iconBase} className={className}>
      <path
        d="M6 3.5h3l1.4 4-2 1.6a13 13 0 0 0 6.5 6.5l1.6-2 4 1.4v3a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 4 5.6 2 2 0 0 1 6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconCalendar({ className = "" }: { className?: string }) {
  return (
    <svg {...iconBase} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3 9.5h18M8 3v3.4M16 3v3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconSearch({ className = "" }: { className?: string }) {
  return (
    <svg {...iconBase} className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconScan({ className = "" }: { className?: string }) {
  return (
    <svg {...iconBase} className={className}>
      <path
        d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Device {
  _id: string;
  deviceId: string;
  clinicName: string;
  city: string;
  latitude: number;
  longitude: number;
  battery: number;
  status: string;
  lastSeen: string;
  phone?: string;
}

interface Clinic {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
}

/**
 * A Booking represents a "Scanner Visit" — the central appointment record.
 * A scanner + operator are resources assigned to it, not the other way round.
 */
type BookingStatus =
  | "Queued"
  | "Pending"
  | "Assigned"
  | "On the Way"
  | "Reached"
  | "Scanning"
  | "Completed"
  | "Cancelled";

interface Booking {
  _id: string;
  clinicName: string;
  clinicAddress: string;
  phone: string;
  scannerId: string | null;
  scannerLocation: string | null;
  bookingDate: string;
  bookingTime: string;
  status: BookingStatus;
  queuePosition: number | null;
}

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */

const ONLINE_THRESHOLD_MS = 120000; // 2 minutes
const API_BASE = "https://threeddigitaldentaldesigners.onrender.com/api";

function isOnline(lastSeen: string) {
  return Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/** Bookings that still occupy a scanner slot (not cancelled/completed). */
function getActiveSlotBookings(bookings: Booking[], date: string, time: string) {
  return bookings.filter(
    (b) =>
      b.bookingDate === date &&
      b.bookingTime === time &&
      b.status !== "Cancelled" &&
      b.status !== "Completed",
  );
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

/**
 * A "pre-booking" is any booking made for a future date (e.g. tomorrow).
 * For pre-bookings we don't require the scanner to be online right now —
 * it just needs to exist. It will be dispatched on the scheduled day.
 */
function isPreBookingDate(date: string) {
  if (!date) return false;
  return date > getTodayStr();
}

/**
 * The pool of scanners that can be considered for a given date.
 *
 * Online/offline is a real-time tracking signal only — it reflects whether
 * we currently know the scanner's live GPS location, nothing more.
 * "Offline" does NOT mean the scanner is unavailable; it still exists and
 * can still be assigned to a booking. Booking eligibility is driven purely
 * by existing bookings vs. scanner capacity (see getSlotAvailability), so
 * every registered scanner is always in the pool — for today's real-time
 * dispatch and for future pre-bookings alike.
 */
function getScannerPool(devices: Device[]) {
  return devices;
}

/**
 * A slot is "expired" once its date + time has already gone by. An expired
 * slot can no longer be booked (that's separately enforced in
 * findNearestScanner), so it shouldn't keep showing as "Booked"/"Queue" —
 * that implies it's occupied by someone else right now, which is
 * misleading for a time that's simply over. Once expired, a slot just
 * reverts to looking exactly like it never had any bookings at all.
 *
 * This only ever applies to today — a future date's slots are always
 * still upcoming, so they're never expired.
 */
function isSlotExpired(date: string, time: string) {
  if (!date || !time) return false;
  return new Date(`${date}T${time}`) < new Date();
}

type SlotStatus = "Available" | "Booked" | "Queue";

interface SlotAvailability {
  /** All registered scanners eligible for this date. */
  pool: Device[];
  /** Scanners in the pool not yet assigned to this exact date + time. */
  freeScanners: Device[];
  status: SlotStatus;
  /** How many requests are already queued past capacity, if status is "Queue". */
  queueCount: number;
}

/**
 * Single source of truth for "is this slot bookable, and with which scanner?"
 * Used by both the time-slot grid (for status/colour) and the
 * find-nearest-scanner flow (for actually picking a free scanner), so the
 * two can never disagree with each other.
 *
 * - Available: nobody has booked this exact date + time slot yet.
 * - Booked: one clinic has already booked this exact slot. That single
 *   booking claims the whole slot for that time — it shows as Booked for
 *   every other clinic even if other scanners are still free, since a
 *   time slot represents one visit, not "however many scanners exist".
 * - Queue: more than one request already exists for this slot (i.e. it
 *   was already Booked and someone else asked anyway), so any further
 *   request joins the queue instead.
 *
 * Note: a scanner's online/offline status never affects this calculation —
 * only whether the slot itself has already been claimed does.
 */
function getSlotAvailability(
  devices: Device[],
  bookings: Booking[],
  date: string,
  time: string,
): SlotAvailability {
  const pool = getScannerPool(devices);
  const slotBookings = getActiveSlotBookings(bookings, date, time);
  const assignedScannerIds = new Set(slotBookings.map((b) => b.scannerId).filter(Boolean));
  const freeScanners = pool.filter((scanner) => !assignedScannerIds.has(scanner.deviceId));

  let status: SlotStatus = "Available";
  let queueCount = 0;

  if (slotBookings.length === 1) {
    status = "Booked";
  } else if (slotBookings.length > 1) {
    status = "Queue";
    queueCount = slotBookings.length - 1;
  }

  return { pool, freeScanners, status, queueCount };
}

/* ------------------------------------------------------------------ */
/*  Map helpers — custom SVG markers, so we never depend on Leaflet's  */
/*  default marker image assets (a common source of broken/blank pins  */
/*  in bundlers like Vite/webpack)                                     */
/* ------------------------------------------------------------------ */

function svgPin(fill: string, glyph: string) {
  return `
    <div style="position:relative;width:34px;height:44px;">
      <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 0C7.6 0 0 7.6 0 17c0 12.7 17 27 17 27s17-14.3 17-27C34 7.6 26.4 0 17 0Z" fill="${fill}"/>
        <circle cx="17" cy="17" r="10" fill="white" fill-opacity="0.16"/>
      </svg>
      <div style="position:absolute;top:6px;left:0;width:34px;text-align:center;font-size:14px;line-height:1;">${glyph}</div>
    </div>
  `;
}

const clinicIcon = L.divIcon({
  className: "",
  html: svgPin(COLORS.ink, "🏥"),
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -40],
});

const scannerOnlineIcon = L.divIcon({
  className: "",
  html: svgPin(COLORS.available, "📡"),
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -40],
});

const scannerOfflineIcon = L.divIcon({
  className: "",
  html: svgPin("#98A2B3", "📡"),
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -40],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:${COLORS.info};border:3px solid white;box-shadow:0 0 0 3px rgba(23,92,211,0.35);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function ChangeMapView({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], 15, {
      animate: true,
    });
  }, [lat, lng, map]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  Small presentational pieces                                        */
/* ------------------------------------------------------------------ */

function StatusPill({ status }: { status: SlotStatus }) {
  const map = {
    Available: { bg: COLORS.availableBg, fg: COLORS.available, label: "Available" },
    Booked: { bg: COLORS.bookedBg, fg: COLORS.booked, label: "Booked" },
    Queue: { bg: COLORS.queueBg, fg: COLORS.queue, label: "Queue" },
  } as const;
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.fg }} />
      {s.label}
    </span>
  );
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.08)] ${className}`}
      style={{ borderColor: COLORS.line }}
    >
      {children}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen pt-28 px-4 md:px-6" style={{ background: COLORS.paper }}>
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-gray-200 mb-3" />
        <div className="h-4 w-96 max-w-full rounded bg-gray-200 mb-8" />
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 h-[520px] rounded-[28px] bg-gray-200" />
          <div className="lg:col-span-3 h-[520px] rounded-[28px] bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

function BookScanner() {
  useInjectFonts();

  const [devices, setDevices] = useState<Device[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [devicesStatus, setDevicesStatus] = useState<"loading" | "ready" | "error">("loading");
  const [clinicsStatus, setClinicsStatus] = useState<"loading" | "ready" | "error">("loading");
  const [bookingsStatus, setBookingsStatus] = useState<"loading" | "ready" | "error">("loading");

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const [nearestScanner, setNearestScanner] = useState<Device | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const [bookingDetails, setBookingDetails] = useState<{
    scanner: Device | null;
    booking: Booking;
    queuePosition: number | null;
  } | null>(null);

  const [searchClinic, setSearchClinic] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showNewClinicForm, setShowNewClinicForm] = useState(false);
  const [isSubmittingClinic, setIsSubmittingClinic] = useState(false);

  const [newClinic, setNewClinic] = useState({
    clinicName: "",
    doctorName: "",
    phone: "",
    address: "",
    city: "",
  });

  const filteredClinics = useMemo(
    () =>
      clinics.filter((clinic) => clinic.name.toLowerCase().includes(searchClinic.toLowerCase())),
    [clinics, searchClinic],
  );

  const fetchDevices = () => {
    setDevicesStatus("loading");
    fetch(`${API_BASE}/device`)
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then((data) => {
        setDevices(Array.isArray(data) ? data : []);
        setDevicesStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        setDevicesStatus("error");
      });
  };

  const fetchClinics = () => {
    setClinicsStatus("loading");
    fetch(`${API_BASE}/clinics`)
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then((data) => {
        setClinics(Array.isArray(data) ? data : []);
        setClinicsStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        setClinicsStatus("error");
      });
  };

  const fetchBookings = () => {
    setBookingsStatus("loading");
    fetch(`${API_BASE}/bookings`)
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
        setBookingsStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        setBookingsStatus("error");
      });
  };

  useEffect(() => {
    fetchDevices();
    fetchClinics();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.error(err);
        setLocationDenied(true);
      },
    );
  }, []);

  /**
   * Looks at the scanner pool for the chosen date (every registered
   * scanner, regardless of online status — see getScannerPool), works out
   * which of them are already committed to the chosen date/time, and
   * either:
   *  - assigns the nearest scanner that is still free for that slot, or
   *  - puts the visit in a queue and reports the clinic's queue position.
   */
  const findNearestScanner = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select date and time");
      return;
    }

    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);

    if (selectedDateTime < new Date()) {
      alert("Please select a future date and time");
      return;
    }
    if (!selectedClinic) {
      alert("Please select a clinic");
      return;
    }

    const { pool, freeScanners, status, queueCount } = getSlotAvailability(
      devices,
      bookings,
      selectedDate,
      selectedTime,
    );

    // No scanners registered at all -> straight into the queue.
    if (pool.length === 0) {
      setNearestScanner(null);
      setQueuePosition(getActiveSlotBookings(bookings, selectedDate, selectedTime).length + 1);
      return;
    }

    // The slot has already been claimed by another clinic -> queue.
    // (First-ever booking for a slot makes it "Booked"; anyone after that
    // is "Queue" — this happens regardless of how many scanners remain
    // free, since a time slot represents one visit, not scanner count.)
    if (status === "Booked" || status === "Queue") {
      setNearestScanner(null);
      setQueuePosition(queueCount + 1);
      return;
    }

    // Slot is still unclaimed — pick the free scanner closest to the
    // clinic. Online/offline status is irrelevant here: a scanner being
    // offline only means its live location isn't currently known, it can
    // still be booked and dispatched.
    let nearest = freeScanners[0];
    let shortestDistance = Infinity;

    freeScanners.forEach((scanner) => {
      const distance = getDistance(
        selectedClinic.latitude,
        selectedClinic.longitude,
        scanner.latitude,
        scanner.longitude,
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearest = scanner;
      }
    });

    setNearestScanner(nearest);
    setQueuePosition(null);
  };

  const bookScanner = async () => {
    if (!selectedClinic) {
      alert("Please select a clinic");
      return;
    }

    if (!nearestScanner && queuePosition === null) {
      alert("Please find nearest scanner first");
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert("Please select booking date and time");
      return;
    }

    const isQueued = queuePosition !== null;
    setIsBooking(true);

    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicName: selectedClinic.name,
          clinicAddress: selectedClinic.address,
          phone: selectedClinic.phone,

          scannerId: nearestScanner?.deviceId ?? null,
          scannerLocation: nearestScanner?.city ?? null,

          bookingDate: selectedDate,
          bookingTime: selectedTime,

          status: isQueued ? "Queued" : "Assigned",
          queuePosition: isQueued ? queuePosition : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        alert(data?.message || "Something went wrong while booking. Please try again.");
        setIsBooking(false);
        return;
      }

      const booking: Booking = await response.json();

      setBookingDetails({
        scanner: nearestScanner,
        booking,
        queuePosition: isQueued ? queuePosition : null,
      });

      setShowAnimation(true);

      setTimeout(() => {
        setShowAnimation(false);
        setBookingSuccess(true);
        setIsBooking(false);
      }, 1800);
    } catch (error) {
      console.error(error);
      alert("We couldn't reach the server. Please check your connection and try again.");
      setIsBooking(false);
    }
  };

  const bookNewClinic = async () => {
    if (!newClinic.clinicName || !newClinic.doctorName || !newClinic.phone || !newClinic.address) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmittingClinic(true);

    try {
      // Register clinic only once
      const clinicResponse = await fetch(`${API_BASE}/clinics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newClinic.clinicName,
          address: newClinic.address,
          phone: newClinic.phone,
          doctorName: newClinic.doctorName,
          city: newClinic.city,
          latitude: 0,
          longitude: 0,
          isApproved: false,
        }),
      });

      if (!clinicResponse.ok) {
        alert("Failed to register clinic");
        setIsSubmittingClinic(false);
        return;
      }

      const createdClinic = await clinicResponse.json();

      const clinic: Clinic = {
        id: createdClinic._id,
        name: createdClinic.name,
        address: createdClinic.address,
        latitude: createdClinic.latitude,
        longitude: createdClinic.longitude,
        phone: createdClinic.phone,
      };

      // Add newly registered clinic to dropdown
      setClinics((prev) => [...prev, clinic]);

      // Automatically select clinic
      setSelectedClinic(clinic);

      // Fill search box
      setSearchClinic(clinic.name);

      // Reset form
      setNewClinic({
        clinicName: "",
        doctorName: "",
        phone: "",
        address: "",
        city: "",
      });

      setShowNewClinicForm(false);
      setIsSubmittingClinic(false);
    } catch (error) {
      console.error(error);
      alert("Server error");
      setIsSubmittingClinic(false);
    }
  };

  const dataLoading =
    devicesStatus === "loading" || clinicsStatus === "loading" || bookingsStatus === "loading";
  const hasCriticalError =
    devicesStatus === "error" || clinicsStatus === "error" || bookingsStatus === "error";

  if (dataLoading && !hasCriticalError) {
    return <PageSkeleton />;
  }

  if (showAnimation) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center z-[9999] px-6"
        style={{
          background: `radial-gradient(120% 120% at 50% 0%, #FFFFFF 0%, ${COLORS.paper} 60%)`,
        }}
      >
        <img src={logo} alt="3D Digital Dental Designers" className="w-32 md:w-40" />

        <div className="relative mt-8 h-16 w-16">
          <div
            className="absolute inset-0 rounded-full border-2 animate-ping"
            style={{ borderColor: COLORS.teal }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full"
            style={{ background: COLORS.teal }}
          >
            <IconScan className="text-white" />
          </div>
        </div>

        <h1
          className="mt-8 text-2xl md:text-4xl font-extrabold text-center"
          style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}
        >
          Assigning your scanner
        </h1>

        <p className="mt-3 text-base text-center max-w-sm" style={{ color: COLORS.slate }}>
          One moment while we confirm the closest available unit for your visit.
        </p>

        <div className="w-72 max-w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-10">
          <div
            className="h-full rounded-full"
            style={{
              background: COLORS.teal,
              animation: "loadingBar 1.8s ease-in-out forwards",
            }}
          />
        </div>

        <style>{`
          @keyframes loadingBar{ from{width:0%;} to{width:100%;} }
        `}</style>
      </div>
    );
  }

  if (bookingSuccess && bookingDetails) {
    const isQueued = bookingDetails.queuePosition !== null;
    const isPreBooked = !isQueued && isPreBookingDate(bookingDetails.booking.bookingDate);
    const headerBg = isQueued ? COLORS.queue : isPreBooked ? "#4338CA" : COLORS.teal;

    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 md:p-6"
        style={{ background: COLORS.paper }}
      >
        <SectionCard className="w-full max-w-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 md:p-10 text-center text-white" style={{ background: headerBg }}>
            <img src={logo} className="w-20 md:w-24 mx-auto mb-5 rounded-2xl bg-white/10 p-2" />

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
              {isQueued ? (
                <IconClock className="h-7 w-7" />
              ) : isPreBooked ? (
                <IconCalendar className="h-7 w-7" />
              ) : (
                <IconCheck className="h-7 w-7" />
              )}
            </div>

            <h1
              className="text-2xl md:text-4xl font-extrabold"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {isQueued
                ? "Visit added to queue"
                : isPreBooked
                  ? "Scanner pre-booked"
                  : "Scanner booked"}
            </h1>

            <p className="mt-3 text-sm md:text-base text-white/85 max-w-md mx-auto">
              {isQueued
                ? "Every nearby scanner is busy for this slot. You'll be assigned automatically the moment one is free."
                : isPreBooked
                  ? `Reserved for ${bookingDetails.booking.bookingDate} at ${bookingDetails.booking.bookingTime}. It will reach your clinic at the scheduled time.`
                  : "Our scanner is on its way to your clinic shortly."}
            </p>
          </div>

          {/* Booking Details */}
          <div className="p-6 md:p-8 space-y-5">
            {isQueued ? (
              <div
                className="rounded-2xl border p-6 text-center"
                style={{ borderColor: COLORS.queue + "33", background: COLORS.queueBg }}
              >
                <p className="text-sm" style={{ color: COLORS.slate }}>
                  Your queue position
                </p>
                <h2 className="text-5xl font-extrabold" style={{ color: COLORS.queue }}>
                  {bookingDetails.queuePosition}
                </h2>
                <p className="mt-2 text-sm" style={{ color: COLORS.slate }}>
                  We'll assign the next available scanner to this visit automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-4" style={{ background: COLORS.paper }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: COLORS.slate }}>
                    Scanner ID
                  </p>
                  <h2 className="text-xl font-bold mt-1" style={{ color: COLORS.ink }}>
                    {bookingDetails.scanner?.deviceId}
                  </h2>
                </div>

                <div className="rounded-2xl p-4" style={{ background: COLORS.paper }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: COLORS.slate }}>
                    Battery
                  </p>
                  <h2
                    className="text-xl font-bold mt-1 flex items-center gap-2"
                    style={{ color: COLORS.available }}
                  >
                    <IconBattery level={bookingDetails.scanner?.battery ?? 0} />
                    {bookingDetails.scanner?.battery}%
                  </h2>
                </div>

                <div className="rounded-2xl p-4" style={{ background: COLORS.paper }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: COLORS.slate }}>
                    Current location
                  </p>
                  <h2 className="text-lg font-semibold mt-1" style={{ color: COLORS.ink }}>
                    {bookingDetails.scanner?.city}
                  </h2>
                </div>

                <div className="rounded-2xl p-4" style={{ background: COLORS.paper }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: COLORS.slate }}>
                    Status
                  </p>
                  <h2 className="text-lg font-semibold mt-1" style={{ color: COLORS.teal }}>
                    {isPreBooked ? "Pre-booked" : bookingDetails.booking.status}
                  </h2>
                </div>
              </div>
            )}

            <hr style={{ borderColor: COLORS.line }} />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: COLORS.slate }}>Clinic</span>
                <strong style={{ color: COLORS.ink }}>{selectedClinic?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.slate }}>Booking date</span>
                <strong style={{ color: COLORS.ink }}>{selectedDate}</strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.slate }}>Booking time</span>
                <strong style={{ color: COLORS.ink }}>{selectedTime}</strong>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-3">
              <a
                href={`tel:${bookingDetails.scanner?.phone || selectedClinic?.phone}`}
                className="flex items-center justify-center gap-2 text-white text-center py-3.5 rounded-2xl font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: COLORS.available }}
              >
                <IconPhone /> {isQueued ? "Call support" : "Call scanner"}
              </a>

              <button
                onClick={() =>
                  navigate({
                    to: "/tracking/$bookingId",
                    params: { bookingId: bookingDetails.booking._id },
                  })
                }
                disabled={isQueued || isPreBooked}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: COLORS.ink }}
              >
                <IconPin />
                {isQueued
                  ? "Tracking unavailable"
                  : isPreBooked
                    ? "Tracking starts on visit day"
                    : "Track scanner"}
              </button>
            </div>

            <button
              onClick={() => {
                setBookingSuccess(false);
                setBookingDetails(null);
                setNearestScanner(null);
                setQueuePosition(null);
                setSelectedClinic(null);
                setSearchClinic("");
                setSelectedDate("");
                setSelectedTime("");
              }}
              className="w-full mt-2 border-2 py-3.5 rounded-2xl font-semibold transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ borderColor: COLORS.teal, color: COLORS.teal }}
            >
              Book another scanner
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  const timeSlots: string[] = [];

  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      timeSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    }
  }

  const preBooking = isPreBookingDate(selectedDate);
  const canFindScanner = !!selectedClinic && !!selectedDate && !!selectedTime;

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-6" style={{ background: COLORS.paper }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: COLORS.ink }}
          >
            <IconScan className="text-white" />
          </span>
          <h1
            className="text-2xl md:text-4xl font-extrabold"
            style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}
          >
            Book scanner service
          </h1>
        </div>

        <p className="mb-6 md:mb-8" style={{ color: COLORS.slate }}>
          Find the nearest available intraoral scanner and schedule a visit.
        </p>

        {hasCriticalError && (
          <div
            className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border p-4"
            style={{ borderColor: COLORS.booked + "33", background: COLORS.bookedBg }}
          >
            <div className="flex items-center gap-2" style={{ color: COLORS.booked }}>
              <IconAlert />
              <span className="text-sm font-medium">
                Some data couldn't be loaded. The page may be incomplete.
              </span>
            </div>
            <button
              onClick={() => {
                if (devicesStatus === "error") fetchDevices();
                if (clinicsStatus === "error") fetchClinics();
                if (bookingsStatus === "error") fetchBookings();
              }}
              className="sm:ml-auto text-sm font-semibold rounded-xl px-4 py-2 text-white transition hover:opacity-90"
              style={{ background: COLORS.booked }}
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          <SectionCard className="lg:col-span-2 p-5 md:p-6 h-fit">
            <h2
              className="text-xl font-bold mb-5"
              style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}
            >
              Find nearest scanner
            </h2>

            <div className="relative mb-4">
              <div className="relative">
                <IconSearch
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                  // eslint-disable-next-line react/forbid-dom-props
                />
                <input
                  type="text"
                  value={searchClinic}
                  onChange={(e) => {
                    setSearchClinic(e.target.value);
                    if (selectedClinic && e.target.value !== selectedClinic.name) {
                      setSelectedClinic(null);
                      setNearestScanner(null);
                      setQueuePosition(null);
                    }
                  }}
                  placeholder="Search clinic name"
                  aria-label="Search clinic name"
                  className="w-full rounded-2xl border p-3 pl-11 text-sm outline-none transition focus:ring-2"
                  style={{ borderColor: COLORS.line }}
                />
              </div>

              {searchClinic.length > 0 && selectedClinic?.name !== searchClinic && (
                <div
                  className="absolute top-full left-0 right-0 bg-white border rounded-2xl shadow-xl max-h-60 overflow-auto z-50 mt-2"
                  style={{ borderColor: COLORS.line }}
                >
                  {filteredClinics.map((clinic) => (
                    <div
                      key={clinic.id}
                      onClick={() => {
                        setSelectedClinic(clinic);
                        setSearchClinic(clinic.name);
                        setNearestScanner(null);
                        setQueuePosition(null);
                      }}
                      className="cursor-pointer p-3 text-sm hover:bg-gray-50 transition"
                    >
                      <p className="font-medium" style={{ color: COLORS.ink }}>
                        {clinic.name}
                      </p>
                      <p className="text-xs" style={{ color: COLORS.slate }}>
                        {clinic.address}
                      </p>
                    </div>
                  ))}

                  {filteredClinics.length === 0 && (
                    <div className="p-3 border-t" style={{ borderColor: COLORS.line }}>
                      <button
                        type="button"
                        onClick={() => setShowNewClinicForm(true)}
                        className="text-sm font-semibold"
                        style={{ color: COLORS.teal }}
                      >
                        + Register new clinic
                      </button>
                    </div>
                  )}
                </div>
              )}

              {showNewClinicForm && (
                <div
                  className="mt-4 space-y-3 rounded-2xl border p-4"
                  style={{ borderColor: COLORS.line, background: COLORS.paper }}
                >
                  <input
                    type="text"
                    placeholder="Clinic name"
                    value={newClinic.clinicName}
                    onChange={(e) => setNewClinic({ ...newClinic, clinicName: e.target.value })}
                    className="w-full rounded-xl border p-2.5 text-sm outline-none focus:ring-2"
                    style={{ borderColor: COLORS.line }}
                  />
                  <input
                    type="text"
                    placeholder="Doctor name"
                    value={newClinic.doctorName}
                    onChange={(e) => setNewClinic({ ...newClinic, doctorName: e.target.value })}
                    className="w-full rounded-xl border p-2.5 text-sm outline-none focus:ring-2"
                    style={{ borderColor: COLORS.line }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={newClinic.phone}
                    onChange={(e) => setNewClinic({ ...newClinic, phone: e.target.value })}
                    className="w-full rounded-xl border p-2.5 text-sm outline-none focus:ring-2"
                    style={{ borderColor: COLORS.line }}
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={newClinic.address}
                    onChange={(e) => setNewClinic({ ...newClinic, address: e.target.value })}
                    className="w-full rounded-xl border p-2.5 text-sm outline-none focus:ring-2"
                    style={{ borderColor: COLORS.line }}
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newClinic.city}
                    onChange={(e) => setNewClinic({ ...newClinic, city: e.target.value })}
                    className="w-full rounded-xl border p-2.5 text-sm outline-none focus:ring-2"
                    style={{ borderColor: COLORS.line }}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={bookNewClinic}
                      disabled={isSubmittingClinic}
                      className="flex-1 text-white p-3 rounded-xl font-semibold transition hover:opacity-90 disabled:opacity-60"
                      style={{ background: COLORS.available }}
                    >
                      {isSubmittingClinic ? "Submitting…" : "Submit clinic request"}
                    </button>
                    <button
                      onClick={() => setShowNewClinicForm(false)}
                      className="px-4 rounded-xl font-semibold border transition hover:bg-white"
                      style={{ borderColor: COLORS.line, color: COLORS.slate }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {selectedClinic && (
              <div
                className="mb-4 rounded-2xl border p-4"
                style={{
                  borderColor: COLORS.infoBg === COLORS.infoBg ? COLORS.line : COLORS.line,
                  background: COLORS.infoBg,
                }}
              >
                {nearestScanner && (
                  <div
                    className="mb-3 rounded-xl border p-3.5"
                    style={{ borderColor: COLORS.available + "33", background: COLORS.availableBg }}
                  >
                    <h3 className="font-bold text-sm" style={{ color: COLORS.available }}>
                      Nearest scanner
                    </h3>
                    <p className="text-sm mt-1 font-semibold" style={{ color: COLORS.ink }}>
                      {nearestScanner.deviceId} · {nearestScanner.city}
                    </p>
                    <p className="text-xs mt-1 font-medium" style={{ color: COLORS.slate }}>
                      {preBooking
                        ? `Reserved for ${selectedDate}`
                        : isOnline(nearestScanner.lastSeen)
                          ? "● Online now"
                          : "● Offline — still bookable"}
                    </p>
                  </div>
                )}

                {queuePosition !== null && (
                  <div
                    className="mb-3 rounded-xl border p-3.5"
                    style={{ borderColor: COLORS.queue + "33", background: COLORS.queueBg }}
                  >
                    <h3 className="font-bold text-sm" style={{ color: COLORS.queue }}>
                      All nearby scanners busy
                    </h3>
                    <p className="text-sm mt-1" style={{ color: COLORS.ink }}>
                      Your visit will be queue position <strong>{queuePosition}</strong> for this
                      slot.
                    </p>
                  </div>
                )}

                <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>
                  {selectedClinic.name}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: COLORS.slate }}>
                  {selectedClinic.address}
                </p>
                <p className="text-xs mt-0.5" style={{ color: COLORS.slate }}>
                  {selectedClinic.phone}
                </p>
              </div>
            )}

            <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.slate }}>
              Visit date
            </label>
            <input
              type="date"
              min={getTodayStr()}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime("");
                setNearestScanner(null);
                setQueuePosition(null);
              }}
              aria-label="Visit date"
              className="w-full rounded-2xl border p-3 mb-4 text-sm outline-none focus:ring-2"
              style={{ borderColor: COLORS.line }}
            />

            {preBooking && (
              <div
                className="mb-4 rounded-2xl border p-3.5 text-xs font-semibold flex items-start gap-2"
                style={{ borderColor: "#4338CA33", background: "#EEF2FF", color: "#4338CA" }}
              >
                <IconCalendar className="mt-0.5 shrink-0" />
                Pre-booking — every registered scanner is available for this date, even if it isn't
                online right now. It will be dispatched on the scheduled day.
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: COLORS.ink }}>
                  Available time slots
                </h3>
                <div
                  className="flex items-center gap-2 text-[11px]"
                  style={{ color: COLORS.slate }}
                >
                  <StatusPill status="Available" />
                  <StatusPill status="Booked" />
                  <StatusPill status="Queue" />
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                {timeSlots.map((slot) => {
                  // Same shared logic used by "Find Nearest Scanner": a
                  // slot turns Booked as soon as one clinic has claimed it,
                  // even if other scanners are still free — a time slot is
                  // one visit, not "one per scanner".
                  const { status: rawStatus, queueCount: queue } = getSlotAvailability(
                    devices,
                    bookings,
                    selectedDate,
                    slot,
                  );

                  // A slot whose time has already passed today reverts to
                  // looking like a plain, never-booked slot instead of
                  // "Booked"/"Queue" — see isSlotExpired above. Tomorrow
                  // this same time slot starts completely fresh anyway,
                  // since bookings are matched on the exact date.
                  const status: SlotStatus = isSlotExpired(selectedDate, slot)
                    ? "Available"
                    : rawStatus;

                  const isSelected = selectedTime === slot;
                  const isDisabled = status === "Booked" || !selectedDate;

                  const styleFor = () => {
                    if (isSelected)
                      return { background: COLORS.ink, color: "white", borderColor: COLORS.ink };
                    if (status === "Available")
                      return {
                        background: COLORS.availableBg,
                        color: COLORS.available,
                        borderColor: COLORS.available + "40",
                      };
                    if (status === "Booked")
                      return {
                        background: COLORS.bookedBg,
                        color: COLORS.booked,
                        borderColor: COLORS.booked + "30",
                      };
                    return {
                      background: COLORS.queueBg,
                      color: COLORS.queue,
                      borderColor: COLORS.queue + "40",
                    };
                  };

                  return (
                    <button
                      key={slot}
                      disabled={isDisabled}
                      onClick={() => {
                        setSelectedTime(slot);
                        setNearestScanner(null);
                        setQueuePosition(null);
                      }}
                      aria-pressed={isSelected}
                      className="rounded-xl p-2.5 border text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 hover:brightness-95 focus:outline-none focus-visible:ring-2"
                      style={styleFor()}
                    >
                      <div>{slot}</div>
                      <div className="mt-0.5 opacity-80">
                        {status === "Available" && "Open"}
                        {status === "Booked" && "Booked"}
                        {status === "Queue" && `Queue · ${queue}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={findNearestScanner}
              disabled={!canFindScanner}
              className="w-full py-3.5 rounded-2xl font-semibold text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2"
              style={{ background: COLORS.teal }}
            >
              {preBooking ? "Find scanner for pre-booking" : "Find nearest scanner"}
            </button>
          </SectionCard>

          <SectionCard className="lg:col-span-3 overflow-hidden">
            <div className="relative">
              <MapContainer
                center={[selectedClinic?.latitude || 12.9716, selectedClinic?.longitude || 77.5946]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: "clamp(360px, 55vh, 600px)", width: "100%" }}
              >
                {selectedClinic && (
                  <ChangeMapView lat={selectedClinic.latitude} lng={selectedClinic.longitude} />
                )}
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {userLocation && (
                  <>
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                      <Popup>Your current location</Popup>
                    </Marker>
                    <Circle
                      center={[userLocation.lat, userLocation.lng]}
                      radius={300}
                      pathOptions={{
                        color: COLORS.info,
                        fillColor: COLORS.info,
                        fillOpacity: 0.08,
                      }}
                    />
                  </>
                )}

                {selectedClinic && (
                  <Marker
                    position={[selectedClinic.latitude, selectedClinic.longitude]}
                    icon={clinicIcon}
                  >
                    <Popup>{selectedClinic.name}</Popup>
                  </Marker>
                )}

                {/*
                  Show every registered scanner on the map, not just the
                  online ones. Offline just means we don't have a fresh GPS
                  fix for it right now — it still exists and is still
                  bookable, so it shouldn't disappear from the map.
                */}
                {devices.map((device) => (
                  <Marker
                    key={device._id}
                    position={[device.latitude, device.longitude]}
                    icon={isOnline(device.lastSeen) ? scannerOnlineIcon : scannerOfflineIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{device.deviceId}</strong>
                        <br />
                        {device.city}
                        <br />
                        {isOnline(device.lastSeen) ? "Online" : "Offline"}
                        <br />
                        Battery: {device.battery}%
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {locationDenied && (
                <div
                  className="absolute top-3 left-3 right-3 sm:right-auto rounded-xl border bg-white/95 backdrop-blur px-3 py-2 text-xs font-medium shadow-md flex items-center gap-2"
                  style={{ borderColor: COLORS.line, color: COLORS.slate }}
                >
                  <IconAlert className="shrink-0" style={{ color: COLORS.queue }} />
                  Location unavailable — showing default map view.
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {(nearestScanner || queuePosition !== null) && (
          <SectionCard
            className="mt-6 p-5 md:p-6"
            style={{
              borderColor: queuePosition !== null ? COLORS.queue + "40" : COLORS.available + "40",
            }}
          >
            {nearestScanner ? (
              <>
                <div className="flex items-center gap-2">
                  <IconCheck style={{ color: COLORS.available }} />
                  <h2 className="text-lg font-bold" style={{ color: COLORS.available }}>
                    {preBooking ? "Scanner reserved for pre-booking" : "Nearest scanner found"}
                  </h2>
                </div>

                <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p style={{ color: COLORS.slate }}>Device</p>
                    <p className="font-semibold" style={{ color: COLORS.ink }}>
                      {nearestScanner.deviceId}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: COLORS.slate }}>Clinic</p>
                    <p className="font-semibold" style={{ color: COLORS.ink }}>
                      {nearestScanner.clinicName}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: COLORS.slate }}>City</p>
                    <p className="font-semibold" style={{ color: COLORS.ink }}>
                      {nearestScanner.city}
                    </p>
                  </div>
                </div>

                {preBooking && (
                  <p className="mt-3 text-sm" style={{ color: "#4338CA" }}>
                    This scanner is pre-booked for {selectedDate} at {selectedTime} — it doesn't
                    need to be online today.
                  </p>
                )}

                <button
                  onClick={bookScanner}
                  disabled={isBooking}
                  className="mt-4 rounded-2xl px-6 py-3 text-white font-semibold transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: COLORS.available }}
                >
                  {isBooking
                    ? "Booking…"
                    : preBooking
                      ? "Confirm pre-booking"
                      : "Book this scanner"}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <IconClock style={{ color: COLORS.queue }} />
                  <h2 className="text-lg font-bold" style={{ color: COLORS.queue }}>
                    All scanners busy — queue position {queuePosition}
                  </h2>
                </div>

                <p className="mt-2 text-sm" style={{ color: COLORS.slate }}>
                  {preBooking
                    ? "Every registered scanner is already pre-booked for this slot. You'll still get a confirmed visit slot; a scanner will be assigned automatically as soon as one frees up."
                    : "You'll still get a confirmed visit slot; a scanner will be assigned to it automatically as soon as one becomes free."}
                </p>

                <button
                  onClick={bookScanner}
                  disabled={isBooking}
                  className="mt-4 rounded-2xl px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: COLORS.queue }}
                >
                  {isBooking ? "Joining…" : "Join queue"}
                </button>
              </>
            )}
          </SectionCard>
        )}

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl md:text-2xl font-bold"
              style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}
            >
              Active scanner agents
            </h2>
            <span className="text-sm" style={{ color: COLORS.slate }}>
              {devices.length} registered
            </span>
          </div>

          {devices.length === 0 ? (
            <SectionCard className="p-8 text-center">
              <p className="text-sm" style={{ color: COLORS.slate }}>
                No scanners are registered yet.
              </p>
            </SectionCard>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => {
                const online = isOnline(device.lastSeen);

                return (
                  <SectionCard key={device._id} className="p-5">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-base" style={{ color: COLORS.ink }}>
                        {device.deviceId}
                      </h3>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          background: online ? COLORS.availableBg : "#F2F4F7",
                          color: online ? COLORS.available : "#667085",
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: online ? COLORS.available : "#98A2B3" }}
                        />
                        {online ? "Online" : "Offline"}
                      </span>
                    </div>

                    <p className="text-sm mt-1.5" style={{ color: COLORS.slate }}>
                      {device.clinicName}
                    </p>
                    <p
                      className="text-sm flex items-center gap-1.5 mt-0.5"
                      style={{ color: COLORS.slate }}
                    >
                      <IconPin className="h-3.5 w-3.5" /> {device.city}
                    </p>

                    <div
                      className="mt-3 flex items-center gap-1.5 text-sm"
                      style={{ color: COLORS.ink }}
                    >
                      <IconBattery level={device.battery} />
                      <span className="font-semibold">{device.battery}%</span>
                    </div>

                    <p className="text-xs mt-3" style={{ color: COLORS.slate }}>
                      Last seen {new Date(device.lastSeen).toLocaleString()}
                    </p>
                  </SectionCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookScanner;
