import { useNavigate, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { getDevices } from "@/lib/deviceApi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const OFFLINE_THRESHOLD_MS = 120000;

function isOnline(device: any) {
  return Date.now() - new Date(device.lastSeen).getTime() < OFFLINE_THRESHOLD_MS;
}

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "").concat(parts[1]?.[0] || "").toUpperCase() || "?";
}

function IconBattery({ level }: { level: number }) {
  const color = level > 50 ? "text-emerald-600" : level > 20 ? "text-amber-600" : "text-red-600";
  return (
    <span className={`inline-flex items-center gap-1 ${color}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0">
        <rect x="2" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M22 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect
          x="4"
          y="9"
          width={Math.max(2, (Math.min(100, Math.max(0, level)) / 100) * 14)}
          height="6"
          rx="1"
          fill="currentColor"
        />
      </svg>
      {level}%
    </span>
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

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusPill({ online }: { online: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${online
          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
          : "bg-red-100 text-red-700 border-red-300"
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-500" : "bg-red-500"}`} />
      {online ? "Online" : "Offline"}
    </span>
  );
}

export default function ScannerTracking() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    loadDevices(true);
    const interval = setInterval(() => loadDevices(false), 10000);

    router.preloadRoute({ to: "/admin/orders" }).catch(() => { });
    router.preloadRoute({ to: "/admin/bookings" }).catch(() => { });
    router.preloadRoute({ to: "/admin/clinics" }).catch(() => { });

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDevices = useCallback(async (showLoading: boolean) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getDevices();
      setDevices(Array.isArray(data) ? data : []);
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

  const stats = useMemo(() => {
    const online = devices.filter(isOnline).length;
    return {
      total: devices.length,
      online,
      offline: devices.length - online,
      cities: new Set(devices.map((d) => d.city)).size,
    };
  }, [devices]);

  const selectedDevice = useMemo(() => {
    if (!devices.length) return null;
    return devices.find((d) => d.deviceId === selectedDeviceId) || devices[0];
  }, [devices, selectedDeviceId]);

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
              Scanner Tracking Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
              Monitor all active scanner agents
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
            { label: "Total Scanners", value: stats.total, color: "text-slate-900" },
            { label: "Online", value: stats.online, color: "text-emerald-600" },
            { label: "Offline", value: stats.offline, color: "text-red-600" },
            { label: "Cities", value: stats.cities, color: "text-blue-600" },
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

        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl h-16 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && devices.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 shadow-sm mb-6">
            No scanners registered yet.
          </div>
        )}

        {/* MOBILE / TABLET: CARD LIST */}
        {!loading && devices.length > 0 && (
          <div className="lg:hidden space-y-3 mb-6">
            {devices.map((device: any) => {
              const online = isOnline(device);
              const active = selectedDevice?.deviceId === device.deviceId;
              return (
                <button
                  key={device.deviceId}
                  onClick={() => setSelectedDeviceId(device.deviceId)}
                  className={`w-full text-left bg-white border rounded-2xl shadow-sm overflow-hidden flex items-stretch gap-3 p-4 transition ${active ? "border-blue-400 ring-1 ring-blue-200" : "border-slate-200"
                    }`}
                >
                  <span
                    className={`w-1 rounded-full shrink-0 ${online ? "bg-emerald-500" : "bg-red-500"
                      }`}
                  />

                  <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-sm shrink-0">
                    {getInitials(device.clinicName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 truncate">
                        {device.clinicName || "Unassigned"}
                      </p>
                      <StatusPill online={online} />
                    </div>

                    <p className="text-sm text-slate-500 truncate mt-0.5 font-mono">
                      {device.deviceId}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <IconPin />
                        {device.city || "-"}
                      </span>
                      <IconBattery level={device.battery ?? 0} />
                      <span className="inline-flex items-center gap-1">
                        <IconClock />
                        {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : "-"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* DESKTOP: TABLE */}
        {!loading && devices.length > 0 && (
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["Device", "Clinic", "City", "Battery", "Status", "Last Seen"].map((h) => (
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
                  {devices.map((device: any) => {
                    const online = isOnline(device);
                    const active = selectedDevice?.deviceId === device.deviceId;
                    return (
                      <tr
                        key={device.deviceId}
                        onClick={() => setSelectedDeviceId(device.deviceId)}
                        className={`border-t border-slate-100 cursor-pointer transition ${active ? "bg-blue-50/70" : "hover:bg-slate-50/80"
                          }`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">
                          {device.deviceId}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {device.clinicName || "-"}
                        </td>
                        <td className="px-4 py-3">{device.city || "-"}</td>
                        <td className="px-4 py-3">
                          <IconBattery level={device.battery ?? 0} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill online={online} />
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LIVE MAP */}
        {selectedDevice && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                Live Scanner Location
              </h2>
              {devices.length > 1 && (
                <select
                  value={selectedDevice.deviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="h-10 border border-slate-300 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                >
                  {devices.map((d: any) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.clinicName || d.deviceId}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Device</p>
                  <p className="font-medium text-slate-800 font-mono">
                    {selectedDevice.deviceId}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Clinic</p>
                  <p className="font-medium text-slate-800">
                    {selectedDevice.clinicName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">City</p>
                  <p className="font-medium text-slate-800">{selectedDevice.city || "-"}</p>
                </div>
              </div>

              <MapContainer
                key={selectedDevice.deviceId}
                center={[selectedDevice.latitude, selectedDevice.longitude]}
                zoom={15}
                style={{
                  height: "320px",
                  width: "100%",
                  borderRadius: "16px",
                }}
                className="sm:!h-[500px]"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[selectedDevice.latitude, selectedDevice.longitude]}>
                  <Popup>
                    <div>
                      <strong>{selectedDevice.deviceId}</strong>
                      <br />
                      {selectedDevice.clinicName}
                      <br />
                      {selectedDevice.city}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}