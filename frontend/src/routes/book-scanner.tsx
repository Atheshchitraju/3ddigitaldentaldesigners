import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { MapContainer as MapContainerType } from "react-leaflet";
import logo from "../assets/3D.webp";

export const Route = createFileRoute("/book-scanner")({ component: BookScanner });

/* ============================================================================
 * PERFORMANCE APPROACH (plain React, no new libraries)
 * ----------------------------------------------------------------------------
 * 1. Only clinics fetch on mount.
 * 2. Devices fetch only after a clinic is selected, scoped to that clinic's city.
 * 3. Bookings fetch only after a date is selected, scoped to that date.
 * 4. Those two fetches hit filtered endpoints (?city=, ?date=) instead of the
 *    full table — the backend needs to support these query params.
 * 5. react-leaflet is loaded with a dynamic import() inside a useEffect, so
 *    its JS doesn't sit in the initial bundle. Until it resolves, the map
 *    slot shows a lightweight placeholder.
 * 6. Nothing blocks the whole page — the form renders immediately; each
 *    section (clinic list, map, time slots, scanner cards) tracks its own
 *    loading flag.
 * 7. A tiny in-memory cache (a plain object living outside the component)
 *    remembers clinics/devices/bookings already fetched, so navigating away
 *    and back doesn't redownload them. It's not as capable as a real caching
 *    library, but it covers the common case without adding a dependency.
 * 8. Backend indexes/select/.lean() are server-side work — not something this
 *    file can do, flagged again at the bottom.
 * ==========================================================================*/

// ---- Design tokens ----
const FONT_LINK_ID = "bsd-font-import";
const COLORS = {
  ink: "#0B1220", slate: "#475467", paper: "#F6F7F9", line: "#E4E7EC",
  teal: "#0F6E6E", tealDark: "#0B5454",
  available: "#12805C", availableBg: "#ECFBF3",
  booked: "#B42318", bookedBg: "#FEF3F2",
  queue: "#B54708", queueBg: "#FFFAEB",
  info: "#175CD3", infoBg: "#EFF8FF",
};

function useInjectFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const pre = document.createElement("link");
    pre.rel = "preconnect";
    pre.href = "https://fonts.gstatic.com";
    pre.crossOrigin = "anonymous";
    document.head.appendChild(pre);

    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.media = "print";
    link.href = "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap";
    link.onload = () => { link.media = "all"; };
    document.head.appendChild(link);
  }, []);
}

// ---- Icons ----
const iconBase = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" } as const;
const Icon = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <svg {...iconBase} className={className}>{children}</svg>
);
const IconPin = ({ className = "" }: { className?: string }) => (
  <Icon className={className}><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" /></Icon>
);
const IconClock = ({ className = "" }: { className?: string }) => (
  <Icon className={className}><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></Icon>
);
const IconBattery = ({ className = "", level = 100 }: { className?: string; level?: number }) => {
  const w = Math.max(2, Math.round((level / 100) * 16));
  return (
    <Icon className={className}>
      <rect x="2" y="8" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="21" y="10.5" width="1.6" height="3" rx="0.8" fill="currentColor" />
      <rect x="4" y="10" width={w} height="4" rx="1" fill="currentColor" />
    </Icon>
  );
};
const IconCheck = ({ className = "" }: { className?: string }) => (
  <Icon className={className}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>
);
const IconAlert = ({ className = "" }: { className?: string }) => (
  <Icon className={className}><path d="M12 3.5 21.5 20h-19L12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="17" r="0.9" fill="currentColor" /></Icon>
);
const IconPhone = ({ className = "" }: { className?: string }) => (
  <Icon className={className}><path d="M6 3.5h3l1.4 4-2 1.6a13 13 0 0 0 6.5 6.5l1.6-2 4 1.4v3a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 4 5.6 2 2 0 0 1 6 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></Icon>
);
const IconCalendar = ({ className = "" }: { className?: string }) => (
  <Icon className={className}><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" /><path d="M3 9.5h18M8 3v3.4M16 3v3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></Icon>
);
const IconSearch = ({ className = "" }: { className?: string }) => (
  <Icon className={className}><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" /><path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></Icon>
);
const IconScan = ({ className = "" }: { className?: string }) => (
  <Icon className={className}><path d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></Icon>
);

// ---- Types ----
interface Device { _id: string; deviceId: string; clinicName: string; city: string; latitude: number; longitude: number; battery: number; status: string; lastSeen: string; phone?: string; }
interface Clinic { id: string; name: string; address: string; city?: string; latitude: number; longitude: number; phone: string; }
type BookingStatus = "Queued" | "Pending" | "Assigned" | "On the Way" | "Reached" | "Scanning" | "Completed" | "Cancelled";
interface Booking { _id: string; clinicName: string; clinicAddress: string; phone: string; scannerId: string | null; scannerLocation: string | null; bookingDate: string; bookingTime: string; status: BookingStatus; queuePosition: number | null; }
type ResourceStatus = "idle" | "loading" | "ready" | "error";

// ---- Constants & helpers ----
const ONLINE_THRESHOLD_MS = 120000; // 2 minutes
const API_BASE = "https://threeddigitaldentaldesigners.onrender.com/api";

const isOnline = (lastSeen: string) => Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const getActiveSlotBookings = (bookings: Booking[], date: string, time: string) =>
  bookings.filter((b) => b.bookingDate === date && b.bookingTime === time && b.status !== "Cancelled" && b.status !== "Completed");

const getTodayStr = () => new Date().toISOString().split("T")[0];
const isPreBookingDate = (date: string) => !!date && date > getTodayStr();

// Every registered scanner for the clinic's city is eligible, online or not
// — an offline scanner just means no fresh GPS fix, it's still bookable.
// That's why the /device request below is filtered by city only, never by
// status: filtering out offline units server-side would break booking.
const getScannerPool = (devices: Device[]) => devices;

const isSlotExpired = (date: string, time: string) => !!date && !!time && new Date(`${date}T${time}`) < new Date();

type SlotStatus = "Available" | "Booked" | "Queue";
interface SlotAvailability { pool: Device[]; freeScanners: Device[]; status: SlotStatus; queueCount: number; }

function getSlotAvailability(devices: Device[], bookings: Booking[], date: string, time: string): SlotAvailability {
  const pool = getScannerPool(devices);
  const slotBookings = getActiveSlotBookings(bookings, date, time);
  const assignedIds = new Set(slotBookings.map((b) => b.scannerId).filter(Boolean));
  const freeScanners = pool.filter((s) => !assignedIds.has(s.deviceId));

  let status: SlotStatus = "Available";
  let queueCount = 0;
  if (slotBookings.length === 1) status = "Booked";
  else if (slotBookings.length > 1) { status = "Queue"; queueCount = slotBookings.length - 1; }

  return { pool, freeScanners, status, queueCount };
}

const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 18; hour++)
    for (let minute = 0; minute < 60; minute += 30)
      slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
  return slots;
})();

const SLOT_STYLES: Record<SlotStatus, { background: string; color: string; borderColor: string }> = {
  Available: { background: COLORS.availableBg, color: COLORS.available, borderColor: COLORS.available + "40" },
  Booked: { background: COLORS.bookedBg, color: COLORS.booked, borderColor: COLORS.booked + "30" },
  Queue: { background: COLORS.queueBg, color: COLORS.queue, borderColor: COLORS.queue + "40" },
};

/* ----------------------------------------------------------------------------
 * Tiny in-memory cache (module scope, so it survives this component
 * unmounting/remounting, e.g. navigating to another route and back).
 * Not a real caching library — just three plain Maps with a TTL check.
 * ------------------------------------------------------------------------- */
const CACHE_TTL_MS = 60_000;
const cache = {
  clinics: null as { data: Clinic[]; ts: number } | null,
  devicesByCity: new Map<string, { data: Device[]; ts: number }>(),
  bookingsByDate: new Map<string, { data: Booking[]; ts: number }>(),
};
const isFresh = (ts: number) => Date.now() - ts < CACHE_TTL_MS;

async function fetchJson<T>(url: string): Promise<T[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// ---- Map markers (built lazily once react-leaflet is actually loaded) ----
const svgPin = (fill: string, glyph: string) => `
  <div style="position:relative;width:34px;height:44px;">
    <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12.7 17 27 17 27s17-14.3 17-27C34 7.6 26.4 0 17 0Z" fill="${fill}"/>
      <circle cx="17" cy="17" r="10" fill="white" fill-opacity="0.16"/>
    </svg>
    <div style="position:absolute;top:6px;left:0;width:34px;text-align:center;font-size:14px;line-height:1;">${glyph}</div>
  </div>`;

// ---- Small presentational pieces ----
function StatusPill({ status }: { status: SlotStatus }) {
  const m = {
    Available: { bg: COLORS.availableBg, fg: COLORS.available, label: "Available" },
    Booked: { bg: COLORS.bookedBg, fg: COLORS.booked, label: "Booked" },
    Queue: { bg: COLORS.queueBg, fg: COLORS.queue, label: "Queue" },
  }[status];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: m.bg, color: m.fg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} />{m.label}
    </span>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-[28px] border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.08)] ${className}`} style={{ borderColor: COLORS.line }}>
      {children}
    </div>
  );
}

interface TimeSlotGridProps { devices: Device[]; bookings: Booking[]; selectedDate: string; selectedTime: string; onSelect: (slot: string) => void; bookingsLoading: boolean; }

const TimeSlotGrid = memo(function TimeSlotGrid({ devices, bookings, selectedDate, selectedTime, onSelect, bookingsLoading }: TimeSlotGridProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: COLORS.ink }}>Available time slots</h3>
        <div className="flex items-center gap-2 text-[11px]" style={{ color: COLORS.slate }}>
          <StatusPill status="Available" /><StatusPill status="Booked" /><StatusPill status="Queue" />
        </div>
      </div>

      {!selectedDate ? (
        <div className="rounded-xl border p-6 text-center text-xs font-medium" style={{ borderColor: COLORS.line, color: COLORS.slate }}>
          Pick a visit date to see slot availability
        </div>
      ) : bookingsLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: COLORS.line }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
          {TIME_SLOTS.map((slot) => {
            const { status: rawStatus, queueCount } = getSlotAvailability(devices, bookings, selectedDate, slot);
            const status: SlotStatus = isSlotExpired(selectedDate, slot) ? "Available" : rawStatus;
            const isSelected = selectedTime === slot;
            const isDisabled = status === "Booked" || !selectedDate;
            const style = isSelected ? { background: COLORS.ink, color: "white", borderColor: COLORS.ink } : SLOT_STYLES[status];

            return (
              <button key={slot} disabled={isDisabled} onClick={() => onSelect(slot)} aria-pressed={isSelected} style={style}
                className="rounded-xl p-2.5 border text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 hover:brightness-95 focus:outline-none focus-visible:ring-2">
                <div>{slot}</div>
                <div className="mt-0.5 opacity-80">
                  {status === "Available" && "Open"}
                  {status === "Booked" && "Booked"}
                  {status === "Queue" && `Queue · ${queueCount}`}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

interface ScannerAgentsListProps { devices: Device[]; selectedClinic: Clinic | null; loading: boolean; }

const ScannerAgentsList = memo(function ScannerAgentsList({ devices, selectedClinic, loading }: ScannerAgentsListProps) {
  if (!selectedClinic)
    return <SectionCard className="p-8 text-center"><p className="text-sm" style={{ color: COLORS.slate }}>Select a clinic above to see IntraOral scanners  near You.</p></SectionCard>;

  if (loading)
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <SectionCard key={i} className="p-5 h-32 animate-pulse" />)}
      </div>
    );

  if (devices.length === 0)
    return <SectionCard className="p-8 text-center"><p className="text-sm" style={{ color: COLORS.slate }}>No scanners are registered near {selectedClinic.name} yet.</p></SectionCard>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map((device) => {
        const online = isOnline(device.lastSeen);
        return (
          <SectionCard key={device._id} className="p-5">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-base" style={{ color: COLORS.ink }}>{device.deviceId}</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: online ? COLORS.availableBg : "#F2F4F7", color: online ? COLORS.available : "#667085" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: online ? COLORS.available : "#98A2B3" }} />
                {online ? "Online" : "Offline"}
              </span>
            </div>
            <p className="text-sm mt-1.5" style={{ color: COLORS.slate }}>{device.clinicName}</p>
            <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: COLORS.slate }}><IconPin className="h-3.5 w-3.5" /> {device.city}</p>
            <div className="mt-3 flex items-center gap-1.5 text-sm" style={{ color: COLORS.ink }}>
              <IconBattery level={device.battery} /><span className="font-semibold">{device.battery}%</span>
            </div>
            <p className="text-xs mt-3" style={{ color: COLORS.slate }}>Last seen {new Date(device.lastSeen).toLocaleString()}</p>
          </SectionCard>
        );
      })}
    </div>
  );
});

const CLINIC_FIELDS: { key: "clinicName" | "doctorName" | "phone" | "address" | "city"; placeholder: string; type?: string }[] = [
  { key: "clinicName", placeholder: "Clinic name" },
  { key: "doctorName", placeholder: "Doctor name" },
  { key: "phone", placeholder: "Phone number", type: "tel" },
  { key: "address", placeholder: "Address" },
  { key: "city", placeholder: "City" },
];

/* ----------------------------------------------------------------------------
 * Map slot — dynamically imports react-leaflet on first render instead of
 * the whole file pulling it in at the top. Kept inside this same file (no
 * extra module) to stay single-file; the dynamic import() is what actually
 * defers the network/JS cost, not a file split.
 * ------------------------------------------------------------------------- */
interface ScannerMapSlotProps { devices: Device[]; selectedClinic: Clinic | null; userLocation: { lat: number; lng: number } | null; locationDenied: boolean; devicesLoading: boolean; }

const ScannerMapSlot = memo(function ScannerMapSlot({ devices, selectedClinic, userLocation, locationDenied, devicesLoading }: ScannerMapSlotProps) {
  const [leaflet, setLeaflet] = useState<null | {
    MapContainer: typeof MapContainerType;
    TileLayer: any; Marker: any; Popup: any; Circle: any; useMap: any; L: any;
  }>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([import("react-leaflet"), import("leaflet")]).then(([rl, leafletMod]) => {
      if (cancelled) return;
      setLeaflet({
        MapContainer: rl.MapContainer, TileLayer: rl.TileLayer, Marker: rl.Marker,
        Popup: rl.Popup, Circle: rl.Circle, useMap: rl.useMap, L: leafletMod.default,
      });
    });
    return () => { cancelled = true; };
  }, []);

  if (!leaflet) {
    return (
      <div className="flex items-center justify-center animate-pulse" style={{ height: "clamp(360px, 55vh, 600px)", width: "100%", background: COLORS.paper, color: COLORS.slate }}>
        <span className="text-sm font-medium">Loading map…</span>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle, useMap, L } = leaflet;

  const clinicIcon = L.divIcon({ className: "", html: svgPin(COLORS.ink, "🏥"), iconSize: [34, 44], iconAnchor: [17, 44], popupAnchor: [0, -40] });
  const scannerOnlineIcon = L.divIcon({ className: "", html: svgPin(COLORS.available, "📡"), iconSize: [34, 44], iconAnchor: [17, 44], popupAnchor: [0, -40] });
  const scannerOfflineIcon = L.divIcon({ className: "", html: svgPin("#98A2B3", "📡"), iconSize: [34, 44], iconAnchor: [17, 44], popupAnchor: [0, -40] });
  const userIcon = L.divIcon({ className: "", html: `<div style="width:16px;height:16px;border-radius:50%;background:${COLORS.info};border:3px solid white;box-shadow:0 0 0 3px rgba(23,92,211,0.35);"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });

  function ChangeMapView({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => { map.setView([lat, lng], 15, { animate: true }); }, [lat, lng, map]);
    return null;
  }

  return (
    <div className="relative">
      <MapContainer center={[selectedClinic?.latitude || 12.9716, selectedClinic?.longitude || 77.5946]} zoom={12} scrollWheelZoom={false} style={{ height: "clamp(360px, 55vh, 600px)", width: "100%" }}>
        {selectedClinic && <ChangeMapView lat={selectedClinic.latitude} lng={selectedClinic.longitude} />}
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}><Popup>Your current location</Popup></Marker>
            <Circle center={[userLocation.lat, userLocation.lng]} radius={300} pathOptions={{ color: COLORS.info, fillColor: COLORS.info, fillOpacity: 0.08 }} />
          </>
        )}

        {selectedClinic && <Marker position={[selectedClinic.latitude, selectedClinic.longitude]} icon={clinicIcon}><Popup>{selectedClinic.name}</Popup></Marker>}

        {devices.map((device) => (
          <Marker key={device._id} position={[device.latitude, device.longitude]} icon={isOnline(device.lastSeen) ? scannerOnlineIcon : scannerOfflineIcon}>
            <Popup>
              <div className="text-sm">
                <strong>{device.deviceId}</strong><br />{device.city}<br />
                {isOnline(device.lastSeen) ? "Online" : "Offline"}<br />Battery: {device.battery}%
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {locationDenied && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto rounded-xl border bg-white/95 backdrop-blur px-3 py-2 text-xs font-medium shadow-md flex items-center gap-2" style={{ borderColor: COLORS.line, color: COLORS.slate }}>
          <IconAlert className="shrink-0" /> Location unavailable — showing default map view.
        </div>
      )}
      {!selectedClinic && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto rounded-xl border bg-white/95 backdrop-blur px-3 py-2 text-xs font-medium shadow-md" style={{ borderColor: COLORS.line, color: COLORS.slate }}>
          Pick a clinic to see nearby scanners
        </div>
      )}
      {selectedClinic && devicesLoading && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto rounded-xl border bg-white/95 backdrop-blur px-3 py-2 text-xs font-medium shadow-md" style={{ borderColor: COLORS.line, color: COLORS.slate }}>
          Loading nearby scanners…
        </div>
      )}
    </div>
  );
});

/* ==================================================================== */
/*  Main component                                                       */
/* ==================================================================== */

function BookScanner() {
  useInjectFonts();

  const [clinics, setClinics] = useState<Clinic[]>(cache.clinics?.data ?? []);
  const [clinicsStatus, setClinicsStatus] = useState<ResourceStatus>(cache.clinics ? "ready" : "loading");

  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesStatus, setDevicesStatus] = useState<ResourceStatus>("idle");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsStatus, setBookingsStatus] = useState<ResourceStatus>("idle");

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const [nearestScanner, setNearestScanner] = useState<Device | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{ scanner: Device | null; booking: Booking; queuePosition: number | null } | null>(null);

  const [searchClinic, setSearchClinic] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showNewClinicForm, setShowNewClinicForm] = useState(false);
  const [isSubmittingClinic, setIsSubmittingClinic] = useState(false);
  const [newClinic, setNewClinic] = useState({ clinicName: "", doctorName: "", phone: "", address: "", city: "" });

  const filteredClinics = useMemo(
    () => clinics.filter((c) => c.name.toLowerCase().includes(searchClinic.toLowerCase())),
    [clinics, searchClinic],
  );

  // #1 — clinics load once, on mount, checking the module-level cache first.
  useEffect(() => {
    if (cache.clinics && isFresh(cache.clinics.ts)) { setClinics(cache.clinics.data); setClinicsStatus("ready"); return; }
    const controller = new AbortController();
    setClinicsStatus("loading");
    fetchJson<Clinic>(`${API_BASE}/clinics`)
      .then((data) => { cache.clinics = { data, ts: Date.now() }; setClinics(data); setClinicsStatus("ready"); })
      .catch((err) => { if (err?.name !== "AbortError") { console.error(err); setClinicsStatus("error"); } });
    return () => controller.abort();
  }, []);

  // #2 — devices only fetch once a clinic (and therefore a city) is selected.
  const clinicCity = selectedClinic?.city ?? selectedClinic?.address ?? "";
  useEffect(() => {
    if (!selectedClinic || !clinicCity) { setDevices([]); setDevicesStatus("idle"); return; }
    const cached = cache.devicesByCity.get(clinicCity);
    if (cached && isFresh(cached.ts)) { setDevices(cached.data); setDevicesStatus("ready"); return; }

    const controller = new AbortController();
    setDevicesStatus("loading");
    fetchJson<Device>(`${API_BASE}/device?city=${encodeURIComponent(clinicCity)}`)
      .then((data) => { cache.devicesByCity.set(clinicCity, { data, ts: Date.now() }); setDevices(data); setDevicesStatus("ready"); })
      .catch((err) => { if (err?.name !== "AbortError") { console.error(err); setDevicesStatus("error"); } });
    return () => controller.abort();
  }, [selectedClinic, clinicCity]);

  // #3 — bookings only fetch once a date is selected.
  useEffect(() => {
    if (!selectedDate) { setBookings([]); setBookingsStatus("idle"); return; }
    const cached = cache.bookingsByDate.get(selectedDate);
    if (cached && isFresh(cached.ts)) { setBookings(cached.data); setBookingsStatus("ready"); return; }

    const controller = new AbortController();
    setBookingsStatus("loading");
    fetchJson<Booking>(`${API_BASE}/bookings?date=${encodeURIComponent(selectedDate)}`)
      .then((data) => { cache.bookingsByDate.set(selectedDate, { data, ts: Date.now() }); setBookings(data); setBookingsStatus("ready"); })
      .catch((err) => { if (err?.name !== "AbortError") { console.error(err); setBookingsStatus("error"); } });
    return () => controller.abort();
  }, [selectedDate]);

  useEffect(() => {
    if (!navigator.geolocation) return setLocationDenied(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => { console.error(err); setLocationDenied(true); },
    );
  }, []);

  const handleSelectTime = useCallback((slot: string) => {
    setSelectedTime(slot);
    setNearestScanner(null);
    setQueuePosition(null);
  }, []);

  const handleSelectClinic = useCallback((clinic: Clinic) => {
    setSelectedClinic(clinic);
    setSearchClinic(clinic.name);
    setNearestScanner(null);
    setQueuePosition(null);
  }, []);

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    setNearestScanner(null);
    setQueuePosition(null);
  }, []);

  const findNearestScanner = () => {
    if (!selectedDate || !selectedTime) return alert("Please select date and time");
    if (new Date(`${selectedDate}T${selectedTime}`) < new Date()) return alert("Please select a future date and time");
    if (!selectedClinic) return alert("Please select a clinic");

    const { pool, freeScanners, status, queueCount } = getSlotAvailability(devices, bookings, selectedDate, selectedTime);

    if (pool.length === 0) {
      setNearestScanner(null);
      setQueuePosition(getActiveSlotBookings(bookings, selectedDate, selectedTime).length + 1);
      return;
    }
    if (status === "Booked" || status === "Queue") {
      setNearestScanner(null);
      setQueuePosition(queueCount + 1);
      return;
    }

    let nearest = freeScanners[0];
    let shortestDistance = Infinity;
    freeScanners.forEach((scanner) => {
      const d = getDistance(selectedClinic.latitude, selectedClinic.longitude, scanner.latitude, scanner.longitude);
      if (d < shortestDistance) { shortestDistance = d; nearest = scanner; }
    });
    setNearestScanner(nearest);
    setQueuePosition(null);
  };

  const bookScanner = async () => {
    if (!selectedClinic) return alert("Please select a clinic");
    if (!nearestScanner && queuePosition === null) return alert("Please find nearest scanner first");
    if (!selectedDate || !selectedTime) return alert("Please select booking date and time");

    const isQueued = queuePosition !== null;
    setIsBooking(true);

    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        return setIsBooking(false);
      }

      const booking: Booking = await response.json();
      setBookingDetails({ scanner: nearestScanner, booking, queuePosition: isQueued ? queuePosition : null });
      setShowAnimation(true);
      // The bookings-for-this-date cache is now stale — drop it so the slot grid re-fetches next time this date is used.
      cache.bookingsByDate.delete(selectedDate);
      setTimeout(() => { setShowAnimation(false); setBookingSuccess(true); setIsBooking(false); }, 1800);
    } catch (error) {
      console.error(error);
      alert("We couldn't reach the server. Please check your connection and try again.");
      setIsBooking(false);
    }
  };

  const bookNewClinic = async () => {
    if (!newClinic.clinicName || !newClinic.doctorName || !newClinic.phone || !newClinic.address)
      return alert("Please fill all required fields");

    setIsSubmittingClinic(true);
    try {
      const res = await fetch(`${API_BASE}/clinics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newClinic, name: newClinic.clinicName, latitude: 0, longitude: 0, isApproved: false }),
      });

      if (!res.ok) { alert("Failed to register clinic"); return setIsSubmittingClinic(false); }

      const created = await res.json();
      const clinic: Clinic = { id: created._id, name: created.name, address: created.address, city: created.city, latitude: created.latitude, longitude: created.longitude, phone: created.phone };

      const updated = [...clinics, clinic];
      cache.clinics = { data: updated, ts: Date.now() };
      setClinics(updated);
      setSelectedClinic(clinic);
      setSearchClinic(clinic.name);
      setNewClinic({ clinicName: "", doctorName: "", phone: "", address: "", city: "" });
      setShowNewClinicForm(false);
      setIsSubmittingClinic(false);
    } catch (error) {
      console.error(error);
      alert("Server error");
      setIsSubmittingClinic(false);
    }
  };

  const hasCriticalError = clinicsStatus === "error" || devicesStatus === "error" || bookingsStatus === "error";

  if (showAnimation) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-[9999] px-6" style={{ background: `radial-gradient(120% 120% at 50% 0%, #FFFFFF 0%, ${COLORS.paper} 60%)` }}>
        <img src={logo} alt="3D Digital Dental Designers" className="w-32 md:w-40" />
        <div className="relative mt-8 h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 animate-ping" style={{ borderColor: COLORS.teal }} />
          <div className="absolute inset-0 flex items-center justify-center rounded-full" style={{ background: COLORS.teal }}><IconScan className="text-white" /></div>
        </div>
        <h1 className="mt-8 text-2xl md:text-4xl font-extrabold text-center" style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}>Assigning your scanner</h1>
        <p className="mt-3 text-base text-center max-w-sm" style={{ color: COLORS.slate }}>One moment while we confirm the closest available unit for your visit.</p>
        <div className="w-72 max-w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-10">
          <div className="h-full rounded-full" style={{ background: COLORS.teal, animation: "loadingBar 1.8s ease-in-out forwards" }} />
        </div>
        <style>{`@keyframes loadingBar{ from{width:0%;} to{width:100%;} }`}</style>
      </div>
    );
  }

  if (bookingSuccess && bookingDetails) {
    const isQueued = bookingDetails.queuePosition !== null;
    const isPreBooked = !isQueued && isPreBookingDate(bookingDetails.booking.bookingDate);
    const headerBg = isQueued ? COLORS.queue : isPreBooked ? "#4338CA" : COLORS.teal;

    const detailBoxes = [
      { label: "Scanner ID", value: bookingDetails.scanner?.deviceId, className: "text-xl font-bold mt-1", color: COLORS.ink },
      { label: "Battery", value: `${bookingDetails.scanner?.battery}%`, className: "text-xl font-bold mt-1 flex items-center gap-2", color: COLORS.available, icon: <IconBattery level={bookingDetails.scanner?.battery ?? 0} /> },
      { label: "Current location", value: bookingDetails.scanner?.city, className: "text-lg font-semibold mt-1", color: COLORS.ink },
      { label: "Status", value: isPreBooked ? "Pre-booked" : bookingDetails.booking.status, className: "text-lg font-semibold mt-1", color: COLORS.teal },
    ];

    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-6" style={{ background: COLORS.paper }}>
        <SectionCard className="w-full max-w-2xl overflow-hidden">
          <div className="p-8 md:p-10 text-center text-white" style={{ background: headerBg }}>
            <img src={logo} className="w-20 md:w-24 mx-auto mb-5 rounded-2xl bg-white/10 p-2" />
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
              {isQueued ? <IconClock className="h-7 w-7" /> : isPreBooked ? <IconCalendar className="h-7 w-7" /> : <IconCheck className="h-7 w-7" />}
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif" }}>
              {isQueued ? "Visit added to queue" : isPreBooked ? "Scanner pre-booked" : "Scanner booked"}
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/85 max-w-md mx-auto">
              {isQueued
                ? "Every nearby scanner is busy for this slot. You'll be assigned automatically the moment one is free."
                : isPreBooked
                  ? `Reserved for ${bookingDetails.booking.bookingDate} at ${bookingDetails.booking.bookingTime}. It will reach your clinic at the scheduled time.`
                  : "Our scanner is on its way to your clinic shortly."}
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-5">
            {isQueued ? (
              <div className="rounded-2xl border p-6 text-center" style={{ borderColor: COLORS.queue + "33", background: COLORS.queueBg }}>
                <p className="text-sm" style={{ color: COLORS.slate }}>Your queue position</p>
                <h2 className="text-5xl font-extrabold" style={{ color: COLORS.queue }}>{bookingDetails.queuePosition}</h2>
                <p className="mt-2 text-sm" style={{ color: COLORS.slate }}>We'll assign the next available scanner to this visit automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {detailBoxes.map((box) => (
                  <div key={box.label} className="rounded-2xl p-4" style={{ background: COLORS.paper }}>
                    <p className="text-xs uppercase tracking-wide" style={{ color: COLORS.slate }}>{box.label}</p>
                    <h2 className={box.className} style={{ color: box.color }}>{box.icon}{box.value}</h2>
                  </div>
                ))}
              </div>
            )}

            <hr style={{ borderColor: COLORS.line }} />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span style={{ color: COLORS.slate }}>Clinic</span><strong style={{ color: COLORS.ink }}>{selectedClinic?.name}</strong></div>
              <div className="flex justify-between"><span style={{ color: COLORS.slate }}>Booking date</span><strong style={{ color: COLORS.ink }}>{selectedDate}</strong></div>
              <div className="flex justify-between"><span style={{ color: COLORS.slate }}>Booking time</span><strong style={{ color: COLORS.ink }}>{selectedTime}</strong></div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-3">
              <a href={`tel:${bookingDetails.scanner?.phone || selectedClinic?.phone}`}
                className="flex items-center justify-center gap-2 text-white text-center py-3.5 rounded-2xl font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: COLORS.available }}>
                <IconPhone /> {isQueued ? "Call support" : "Call scanner"}
              </a>
              <button
                onClick={() => navigate({ to: "/tracking/$bookingId", params: { bookingId: bookingDetails.booking._id } })}
                disabled={isQueued || isPreBooked}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: COLORS.ink }}>
                <IconPin />
                {isQueued ? "Tracking unavailable" : isPreBooked ? "Tracking starts on visit day" : "Track scanner"}
              </button>
            </div>

            <button
              onClick={() => {
                setBookingSuccess(false); setBookingDetails(null); setNearestScanner(null); setQueuePosition(null);
                setSelectedClinic(null); setSearchClinic(""); setSelectedDate(""); setSelectedTime("");
              }}
              className="w-full mt-2 border-2 py-3.5 rounded-2xl font-semibold transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ borderColor: COLORS.teal, color: COLORS.teal }}>
              Book another scanner
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  const preBooking = isPreBookingDate(selectedDate);
  const canFindScanner = !!selectedClinic && !!selectedDate && !!selectedTime;

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-6" style={{ background: COLORS.paper }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: COLORS.ink }}><IconScan className="text-white" /></span>
          <h1 className="text-2xl md:text-4xl font-extrabold" style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}>Book scanner service</h1>
        </div>
        <p className="mb-6 md:mb-8" style={{ color: COLORS.slate }}>Find the nearest available intraoral scanner and schedule a visit.</p>

        {hasCriticalError && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border p-4" style={{ borderColor: COLORS.booked + "33", background: COLORS.bookedBg }}>
            <div className="flex items-center gap-2" style={{ color: COLORS.booked }}><IconAlert /><span className="text-sm font-medium">Some data couldn't be loaded. The page may be incomplete.</span></div>
            <button
              onClick={() => {
                if (clinicsStatus === "error") { cache.clinics = null; setClinicsStatus("loading"); fetchJson<Clinic>(`${API_BASE}/clinics`).then((d) => { cache.clinics = { data: d, ts: Date.now() }; setClinics(d); setClinicsStatus("ready"); }).catch(() => setClinicsStatus("error")); }
                if (devicesStatus === "error" && clinicCity) { cache.devicesByCity.delete(clinicCity); setDevicesStatus("loading"); fetchJson<Device>(`${API_BASE}/device?city=${encodeURIComponent(clinicCity)}`).then((d) => { cache.devicesByCity.set(clinicCity, { data: d, ts: Date.now() }); setDevices(d); setDevicesStatus("ready"); }).catch(() => setDevicesStatus("error")); }
                if (bookingsStatus === "error" && selectedDate) { cache.bookingsByDate.delete(selectedDate); setBookingsStatus("loading"); fetchJson<Booking>(`${API_BASE}/bookings?date=${encodeURIComponent(selectedDate)}`).then((d) => { cache.bookingsByDate.set(selectedDate, { data: d, ts: Date.now() }); setBookings(d); setBookingsStatus("ready"); }).catch(() => setBookingsStatus("error")); }
              }}
              className="sm:ml-auto text-sm font-semibold rounded-xl px-4 py-2 text-white transition hover:opacity-90"
              style={{ background: COLORS.booked }}>
              Retry
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          <SectionCard className="lg:col-span-2 p-5 md:p-6 h-fit">
            <h2 className="text-xl font-bold mb-5" style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}>Find nearest scanner</h2>

            <div className="relative mb-4">
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchClinic}
                  onChange={(e) => {
                    setSearchClinic(e.target.value);
                    if (selectedClinic && e.target.value !== selectedClinic.name) {
                      setSelectedClinic(null); setNearestScanner(null); setQueuePosition(null);
                    }
                  }}
                  placeholder="Search clinic name"
                  aria-label="Search clinic name"
                  className="w-full rounded-2xl border p-3 pl-11 text-sm outline-none transition focus:ring-2"
                  style={{ borderColor: COLORS.line }}
                  disabled={clinicsStatus === "loading"}
                />
              </div>

              {clinicsStatus === "loading" && (
                <p className="mt-2 text-xs font-medium" style={{ color: COLORS.slate }}>Loading clinics…</p>
              )}

              {searchClinic.length > 0 && selectedClinic?.name !== searchClinic && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-2xl shadow-xl max-h-60 overflow-auto z-50 mt-2" style={{ borderColor: COLORS.line }}>
                  {filteredClinics.map((clinic) => (
                    <div key={clinic.id}
                      onClick={() => handleSelectClinic(clinic)}
                      className="cursor-pointer p-3 text-sm hover:bg-gray-50 transition">
                      <p className="font-medium" style={{ color: COLORS.ink }}>{clinic.name}</p>
                      <p className="text-xs" style={{ color: COLORS.slate }}>{clinic.address}</p>
                    </div>
                  ))}
                  {filteredClinics.length === 0 && clinicsStatus !== "loading" && (
                    <div className="p-3 border-t" style={{ borderColor: COLORS.line }}>
                      <button type="button" onClick={() => setShowNewClinicForm(true)} className="text-sm font-semibold" style={{ color: COLORS.teal }}>+ Register new clinic</button>
                    </div>
                  )}
                </div>
              )}

              {showNewClinicForm && (
                <div className="mt-4 space-y-3 rounded-2xl border p-4" style={{ borderColor: COLORS.line, background: COLORS.paper }}>
                  {CLINIC_FIELDS.map(({ key, placeholder, type = "text" }) => (
                    <input
                      key={key}
                      type={type}
                      placeholder={placeholder}
                      value={newClinic[key]}
                      onChange={(e) => setNewClinic({ ...newClinic, [key]: e.target.value })}
                      className="w-full rounded-xl border p-2.5 text-sm outline-none focus:ring-2"
                      style={{ borderColor: COLORS.line }}
                    />
                  ))}
                  <div className="flex gap-2">
                    <button onClick={bookNewClinic} disabled={isSubmittingClinic} className="flex-1 text-white p-3 rounded-xl font-semibold transition hover:opacity-90 disabled:opacity-60" style={{ background: COLORS.available }}>
                      {isSubmittingClinic ? "Submitting…" : "Submit clinic request"}
                    </button>
                    <button onClick={() => setShowNewClinicForm(false)} className="px-4 rounded-xl font-semibold border transition hover:bg-white" style={{ borderColor: COLORS.line, color: COLORS.slate }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {selectedClinic && (
              <div className="mb-4 rounded-2xl border p-4" style={{ borderColor: COLORS.line, background: COLORS.infoBg }}>
                {nearestScanner && (
                  <div className="mb-3 rounded-xl border p-3.5" style={{ borderColor: COLORS.available + "33", background: COLORS.availableBg }}>
                    <h3 className="font-bold text-sm" style={{ color: COLORS.available }}>Nearest scanner</h3>
                    <p className="text-sm mt-1 font-semibold" style={{ color: COLORS.ink }}>{nearestScanner.deviceId} · {nearestScanner.city}</p>
                    <p className="text-xs mt-1 font-medium" style={{ color: COLORS.slate }}>
                      {preBooking ? `Reserved for ${selectedDate}` : isOnline(nearestScanner.lastSeen) ? "● Online now" : "● Offline — still bookable"}
                    </p>
                  </div>
                )}
                {queuePosition !== null && (
                  <div className="mb-3 rounded-xl border p-3.5" style={{ borderColor: COLORS.queue + "33", background: COLORS.queueBg }}>
                    <h3 className="font-bold text-sm" style={{ color: COLORS.queue }}>All nearby scanners busy</h3>
                    <p className="text-sm mt-1" style={{ color: COLORS.ink }}>Your visit will be queue position <strong>{queuePosition}</strong> for this slot.</p>
                  </div>
                )}
                <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>{selectedClinic.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: COLORS.slate }}>{selectedClinic.address}</p>
                <p className="text-xs mt-0.5" style={{ color: COLORS.slate }}>{selectedClinic.phone}</p>
              </div>
            )}

            <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.slate }}>Visit date</label>
            <input
              type="date"
              min={getTodayStr()}
              value={selectedDate}
              onChange={(e) => handleSelectDate(e.target.value)}
              aria-label="Visit date"
              className="w-full rounded-2xl border p-3 mb-4 text-sm outline-none focus:ring-2"
              style={{ borderColor: COLORS.line }}
            />

            {preBooking && (
              <div className="mb-4 rounded-2xl border p-3.5 text-xs font-semibold flex items-start gap-2" style={{ borderColor: "#4338CA33", background: "#EEF2FF", color: "#4338CA" }}>
                <IconCalendar className="mt-0.5 shrink-0" />
                Pre-booking — every registered scanner is available for this date, even if it isn't online right now. It will be dispatched on the scheduled day.
              </div>
            )}

            <TimeSlotGrid devices={devices} bookings={bookings} selectedDate={selectedDate} selectedTime={selectedTime} onSelect={handleSelectTime} bookingsLoading={bookingsStatus === "loading"} />

            <button
              onClick={findNearestScanner}
              disabled={!canFindScanner || devicesStatus === "loading" || bookingsStatus === "loading"}
              className="w-full py-3.5 rounded-2xl font-semibold text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2"
              style={{ background: COLORS.teal }}>
              {devicesStatus === "loading" || bookingsStatus === "loading" ? "Loading…" : preBooking ? "Find scanner for pre-booking" : "Find nearest scanner"}
            </button>
          </SectionCard>

          <SectionCard className="lg:col-span-3 overflow-hidden">
            <ScannerMapSlot devices={devices} selectedClinic={selectedClinic} userLocation={userLocation} locationDenied={locationDenied} devicesLoading={devicesStatus === "loading"} />
          </SectionCard>
        </div>

        {(nearestScanner || queuePosition !== null) && (
          <SectionCard className="mt-6 p-5 md:p-6" style={{ borderColor: queuePosition !== null ? COLORS.queue + "40" : COLORS.available + "40" }}>
            {nearestScanner ? (
              <>
                <div className="flex items-center gap-2">
                  <IconCheck style={{ color: COLORS.available }} />
                  <h2 className="text-lg font-bold" style={{ color: COLORS.available }}>{preBooking ? "Scanner reserved for pre-booking" : "Nearest scanner found"}</h2>
                </div>
                <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
                  <div><p style={{ color: COLORS.slate }}>Device</p><p className="font-semibold" style={{ color: COLORS.ink }}>{nearestScanner.deviceId}</p></div>
                  <div><p style={{ color: COLORS.slate }}>Clinic</p><p className="font-semibold" style={{ color: COLORS.ink }}>{nearestScanner.clinicName}</p></div>
                  <div><p style={{ color: COLORS.slate }}>City</p><p className="font-semibold" style={{ color: COLORS.ink }}>{nearestScanner.city}</p></div>
                </div>
                {preBooking && <p className="mt-3 text-sm" style={{ color: "#4338CA" }}>This scanner is pre-booked for {selectedDate} at {selectedTime} — it doesn't need to be online today.</p>}
                <button onClick={bookScanner} disabled={isBooking} className="mt-4 rounded-2xl px-6 py-3 text-white font-semibold transition hover:opacity-90 disabled:opacity-60" style={{ background: COLORS.available }}>
                  {isBooking ? "Booking…" : preBooking ? "Confirm pre-booking" : "Book this scanner"}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <IconClock style={{ color: COLORS.queue }} />
                  <h2 className="text-lg font-bold" style={{ color: COLORS.queue }}>All scanners busy — queue position {queuePosition}</h2>
                </div>
                <p className="mt-2 text-sm" style={{ color: COLORS.slate }}>
                  {preBooking
                    ? "Every registered scanner is already pre-booked for this slot. You'll still get a confirmed visit slot; a scanner will be assigned automatically as soon as one frees up."
                    : "You'll still get a confirmed visit slot; a scanner will be assigned to it automatically as soon as one becomes free."}
                </p>
                <button onClick={bookScanner} disabled={isBooking} className="mt-4 rounded-2xl px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60" style={{ background: COLORS.queue }}>
                  {isBooking ? "Joining…" : "Join queue"}
                </button>
              </>
            )}
          </SectionCard>
        )}

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: COLORS.ink, fontFamily: "Manrope, sans-serif" }}>Active scanner agents</h2>
            <span className="text-sm" style={{ color: COLORS.slate }}>{selectedClinic ? `${devices.length} near ${clinicCity || selectedClinic.name}` : "—"}</span>
          </div>
          <ScannerAgentsList devices={devices} selectedClinic={selectedClinic} loading={devicesStatus === "loading"} />
        </div>
      </div>
    </div>
  );
}

export default BookScanner;

/* ----------------------------------------------------------------------------
 * Still needed server-side (can't be done from this file):
 * - GET /api/device should accept ?city= and filter there (never &status=,
 *   since offline scanners must stay bookable).
 * - GET /api/bookings should accept ?date= and filter there.
 * - Add Mongo indexes on city, bookingDate, bookingTime, scannerId, status,
 *   and use .lean()/.select() on these read paths.
 * ------------------------------------------------------------------------- */