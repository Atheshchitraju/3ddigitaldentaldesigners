import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/tracking/$bookingId")({
  component: TrackingPage,
});

const API = "https://threeddigitaldentaldesigners.onrender.com";

interface Booking {
  _id: string;
  clinicName: string;
  clinicAddress: string;
  scannerId: string;
  bookingDate: string;
  bookingTime: string;
}
interface Clinic {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
}
interface Device {
  _id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  battery: number;
  city: string;
  status: string;
  lastSeen: string;
}
interface RouteInfo {
  coords: [number, number][];
  distanceKm: number;
  durationMin: number;
  eta: string;
}

// ── OSRM routing ─────────────────────────────────────────────────────────────
async function fetchRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<RouteInfo | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson&steps=false`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return null;
    const r = data.routes[0];
    const etaDate = new Date(Date.now() + r.duration * 1000);
    return {
      distanceKm: +(r.distance / 1000).toFixed(1),
      durationMin: Math.ceil(r.duration / 60),
      eta: etaDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      coords: r.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]),
    };
  } catch {
    return null;
  }
}

function fmtDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60),
    m = min % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

// ── Custom van SVG icon ───────────────────────────────────────────────────────
const vanIcon = L.divIcon({
  className: "",
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  html: `
    <div style="
      width:44px;height:44px;border-radius:50%;
      background:#0066CC;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 12px rgba(0,102,204,0.45);
      border:3px solid #fff;
    ">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           xmlns="http://www.w3.org/2000/svg">
        <path d="M1 10.5V17a1 1 0 001 1h1.5" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M17.5 18H20a1 1 0 001-1v-5l-2.33-4.5A2 2 0 0016.9 6.5H13V18" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 6.5h11v9.5H2z" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="5.5" cy="18" r="1.8" fill="white"/>
        <circle cx="14.5" cy="18" r="1.8" fill="white"/>
      </svg>
    </div>
  `,
});

const clinicIcon = L.divIcon({
  className: "",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  html: `
    <div style="
      width:38px;height:38px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:#1D1D1F;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 10px rgba(0,0,0,0.3);
      border:2px solid #fff;
    ">
      <div style="transform:rotate(45deg);font-size:16px;line-height:1;">🏥</div>
    </div>
  `,
});

// ── Smooth animated marker — moves like Uber ─────────────────────────────────
interface SmoothMarkerProps {
  position: [number, number];
  icon: L.DivIcon;
  children?: React.ReactNode;
}

function SmoothMarker({ position, icon, children }: SmoothMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null);
  const prevPos = useRef<[number, number]>(position);
  const animRef = useRef<number | null>(null);

  // On every position change, interpolate smoothly over 2s
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const [fromLat, fromLng] = prevPos.current;
    const [toLat, toLng] = position;

    // Nothing changed
    if (fromLat === toLat && fromLng === toLng) return;

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const duration = 2000; // ms — smooth 2-second glide
    const start = performance.now();

    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      const lat = fromLat + (toLat - fromLat) * ease;
      const lng = fromLng + (toLng - fromLng) * ease;
      marker.setLatLng([lat, lng]);
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        prevPos.current = [toLat, toLng];
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [position]);

  return (
    <Marker ref={markerRef} position={prevPos.current} icon={icon}>
      {children}
    </Marker>
  );
}

// ── Pan map to keep scanner in view ──────────────────────────────────────────
function MapController({ scannerPos }: { scannerPos: [number, number] }) {
  const map = useMap();
  const isInit = useRef(false);

  useEffect(() => {
    if (!isInit.current) {
      isInit.current = true;
      return; // skip first — MapContainer already centers
    }
    // Softly pan to keep scanner visible without jarring jumps
    if (!map.getBounds().contains(scannerPos)) {
      map.panTo(scannerPos, { animate: true, duration: 1.2 });
    }
  }, [scannerPos]);

  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 150);
  }, []);

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

function TrackingPage() {
  const { bookingId } = Route.useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [scanner, setScanner] = useState<Device | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(false); // flashes on update

  // Separate scanner position state so marker updates without remounting map
  const [scannerPos, setScannerPos] = useState<[number, number] | null>(null);

  const loadTracking = async () => {
    try {
      const bookingRes = await fetch(`${API}/api/bookings/${bookingId}`);
      const bookingData = await bookingRes.json();
      setBooking(bookingData);

      const clinicRes = await fetch(`${API}/api/clinics`);
      const clinicList = await clinicRes.json();
      const foundClinic = clinicList.find(
        (c: Clinic) => c.name.trim().toLowerCase() === bookingData.clinicName.trim().toLowerCase(),
      );
      setClinic(foundClinic);

      const deviceRes = await fetch(`${API}/api/device`);
      const devices = await deviceRes.json();
      const foundScanner = devices.find((d: Device) => d.deviceId === bookingData.scannerId);
      setScanner(foundScanner);

      if (foundScanner) {
        const newPos: [number, number] = [foundScanner.latitude, foundScanner.longitude];
        setScannerPos(newPos);
      }

      if (foundScanner && foundClinic) {
        const routeInfo = await fetchRoute(
          { lat: foundScanner.latitude, lng: foundScanner.longitude },
          { lat: foundClinic.latitude, lng: foundClinic.longitude },
        );
        setRoute(routeInfo);
      }

      // Flash the live badge
      setPulse(true);
      setTimeout(() => setPulse(false), 800);

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadTracking();
    const interval = setInterval(loadTracking, 10000); // every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="tp-center">
        <style>{css}</style>
        <div className="tp-spinner-wrap">
          <div className="tp-spinner" />
          <p className="tp-spinner-label">Locating scanner…</p>
        </div>
      </div>
    );

  if (!booking || !clinic || !scanner || !scannerPos)
    return (
      <div className="tp-center">
        <style>{css}</style>
        <div className="tp-error-box">
          <p className="tp-error-title">No tracking data</p>
          <p className="tp-error-sub">Check your booking ID and try again.</p>
        </div>
      </div>
    );

  const batteryColor =
    scanner.battery > 50 ? "#34C759" : scanner.battery > 20 ? "#FF9F0A" : "#FF3B30";
  const lastSeenStr = new Date(scanner.lastSeen).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const clinicPos: [number, number] = [clinic.latitude, clinic.longitude];
  const routeCoords: [number, number][] = route?.coords ?? [scannerPos, clinicPos];

  return (
    <div className="tp-page">
      <style>{css}</style>
      <div className="tp-root">
        {/* ── Map ── */}
        <main className="tp-map-wrap">
          <div className="tp-map-inner">
            {/* Map mounts ONCE — no key prop — so it never remounts */}
            <MapContainer
              center={[
                (clinic.latitude + scannerPos[0]) / 2,
                (clinic.longitude + scannerPos[1]) / 2,
              ]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <MapController scannerPos={scannerPos} />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />

              {/* Clinic — static, plain Marker is fine */}
              <Marker position={clinicPos} icon={clinicIcon}>
                <Popup>
                  <strong>{clinic.name}</strong>
                  <br />
                  {clinic.address}
                </Popup>
              </Marker>

              {/* Scanner — SmoothMarker animates position changes */}
              <SmoothMarker position={scannerPos} icon={vanIcon}>
                <Popup>
                  <strong>{scanner.deviceId}</strong>
                  <br />
                  {route ? `${fmtDuration(route.durationMin)} away` : "En route"}
                </Popup>
              </SmoothMarker>

              {/* Road route polyline — updates in-place */}
              <Polyline
                positions={routeCoords}
                pathOptions={
                  route
                    ? {
                        color: "#0066CC",
                        weight: 4,
                        opacity: 0.85,
                        lineCap: "round",
                        lineJoin: "round",
                      }
                    : { color: "#0066CC", weight: 2, dashArray: "6 5", opacity: 0.55 }
                }
              />
            </MapContainer>
          </div>

          {/* Floating ETA chip */}
          {route && (
            <div className="tp-eta-chip">
              <div className="tp-eta-van-dot" />
              <div className="tp-eta-info">
                <span className="tp-eta-time">{fmtDuration(route.durationMin)}</span>
                <span className="tp-eta-sub">
                  ETA {route.eta} · {route.distanceKm} km
                </span>
              </div>
            </div>
          )}
        </main>

        {/* ── Sidebar ── */}
        <aside className="tp-sidebar">
          <div className="tp-topbar">
            <div className={`tp-live-badge ${pulse ? "tp-live-badge--pulse" : ""}`}>
              <span className="tp-live-dot" />
              <span className="tp-live-label">Live</span>
            </div>
            <span className="tp-sync-label">Updated {lastSeenStr}</span>
          </div>

          <div className="tp-title-block">
            <h1 className="tp-page-title">Scanner En Route</h1>
            <p className="tp-page-sub">
              {scanner.deviceId} → {clinic.name}
            </p>
          </div>

          <div className="tp-divider" />

          {/* Route card */}
          {route ? (
            <div className="tp-route-card">
              <div className="tp-route-cell">
                <span className="tp-route-label">ETA</span>
                <span className="tp-route-value tp-accent">{route.eta}</span>
              </div>
              <div className="tp-route-vr" />
              <div className="tp-route-cell">
                <span className="tp-route-label">Travel time</span>
                <span className="tp-route-value">{fmtDuration(route.durationMin)}</span>
              </div>
              <div className="tp-route-vr" />
              <div className="tp-route-cell">
                <span className="tp-route-label">Distance</span>
                <span className="tp-route-value">{route.distanceKm} km</span>
              </div>
            </div>
          ) : (
            <div className="tp-route-card tp-route-card--loading">
              <span className="tp-route-loading-dot" />
              <span style={{ color: "var(--text2)", fontSize: 13 }}>Calculating route…</span>
            </div>
          )}

          <div className="tp-divider" />

          <div className="tp-stats-row">
            <div className="tp-stat-cell">
              <span className="tp-stat-label">Status</span>
              <span className="tp-stat-value tp-accent">{scanner.status}</span>
            </div>
            <div className="tp-stat-vr" />
            <div className="tp-stat-cell">
              <span className="tp-stat-label">City</span>
              <span className="tp-stat-value">{scanner.city}</span>
            </div>
            <div className="tp-stat-vr" />
            <div className="tp-stat-cell">
              <span className="tp-stat-label">Scanner</span>
              <span className="tp-stat-value tp-mono tp-accent">{scanner.deviceId}</span>
            </div>
          </div>

          <div className="tp-divider" />

          <div className="tp-section">
            <div className="tp-section-row">
              <span className="tp-field-label">Battery</span>
              <span className="tp-field-value" style={{ color: batteryColor }}>
                {scanner.battery}%
              </span>
            </div>
            <div className="tp-battery-track">
              <div
                className="tp-battery-fill"
                style={{ width: `${scanner.battery}%`, backgroundColor: batteryColor }}
              />
              <div className="tp-battery-nub" />
            </div>
          </div>

          <div className="tp-divider" />

          <div className="tp-grid">
            <div className="tp-grid-cell">
              <span className="tp-field-label">Destination</span>
              <p className="tp-field-primary">{clinic.name}</p>
              <p className="tp-field-secondary">{clinic.address}</p>
            </div>
            <div className="tp-grid-cell">
              <span className="tp-field-label">Appointment</span>
              <p className="tp-field-primary">{booking.bookingDate}</p>
              <p className="tp-field-secondary tp-accent" style={{ fontWeight: 500 }}>
                {booking.bookingTime}
              </p>
            </div>
          </div>

          <div className="tp-spacer" />

          <div className="tp-footer-info">
            <div className="tp-footer-row">
              <span className="tp-footer-label">Last seen</span>
              <span className="tp-footer-value">{lastSeenStr}</span>
            </div>
            <div className="tp-footer-row">
              <span className="tp-footer-label">Coordinates</span>
              <span className="tp-footer-value tp-mono">
                {scanner.latitude.toFixed(4)}, {scanner.longitude.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="tp-cta-wrap">
            <a href={`tel:${clinic.phone}`} className="tp-call-btn">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.53 2 2 0 0 1 3.6 1.36h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Call Clinic
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
  :root {
    --white:   #FFFFFF;
    --bg2:     #F5F5F7;
    --divider: #D2D2D7;
    --text1:   #1D1D1F;
    --text2:   #6E6E73;
    --accent:  #0066CC;
    --green:   #34C759;
    --font:    -apple-system,'SF Pro Display','SF Pro Text',BlinkMacSystemFont,'Helvetica Neue',sans-serif;
    --mono:    'SF Mono','Fira Code','Courier New',monospace;
    --nav-h:   68px;
  }

  header,nav,[class*='navbar'],[class*='nav-bar'],[class*='Navbar'] {
    z-index:1000 !important; position:relative;
  }

  *,*::before,*::after { box-sizing:border-box; }
  p,h1 { margin:0; }

  @keyframes spin      { to { transform:rotate(360deg); } }
  @keyframes livePulse { 0%,100%{opacity:1;}50%{opacity:0.3;} }
  @keyframes fadeIn    { from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;} }
  @keyframes badgePop  { 0%{transform:scale(1);}50%{transform:scale(1.15);}100%{transform:scale(1);} }

  .tp-center {
    padding-top:var(--nav-h); min-height:100dvh;
    display:flex;align-items:center;justify-content:center;
    background:var(--white);font-family:var(--font);
  }
  .tp-spinner-wrap{display:flex;flex-direction:column;align-items:center;gap:14px;}
  .tp-spinner{width:28px;height:28px;border:2px solid var(--divider);border-top-color:var(--accent);border-radius:50%;animation:spin .75s linear infinite;}
  .tp-spinner-label{color:var(--text2);font-size:13px;font-family:var(--font);}
  .tp-error-box{text-align:center;max-width:300px;}
  .tp-error-title{color:var(--text1);font-size:17px;font-weight:600;font-family:var(--font);letter-spacing:-.02em;margin-bottom:6px;}
  .tp-error-sub{color:var(--text2);font-size:14px;font-family:var(--font);}

  .tp-page{padding-top:var(--nav-h);height:100dvh;background:var(--bg2);font-family:var(--font);}

  /* MOBILE */
  .tp-root{display:flex;flex-direction:column;height:calc(100dvh - var(--nav-h));overflow:hidden;}

  .tp-map-wrap{flex-shrink:0;width:100%;height:42%;padding:10px 10px 0;position:relative;z-index:0;}

  .tp-map-inner{
    width:100%;height:100%;border-radius:16px;overflow:hidden;
    border:1px solid var(--divider);background:var(--bg2);isolation:isolate;
  }
  .tp-map-inner .leaflet-pane{z-index:auto;}
  .tp-map-inner .leaflet-map-pane{z-index:1;}
  .tp-map-inner .leaflet-tile-pane{z-index:2;}
  .tp-map-inner .leaflet-overlay-pane{z-index:3;}
  .tp-map-inner .leaflet-shadow-pane{z-index:4;}
  .tp-map-inner .leaflet-marker-pane{z-index:5;}
  .tp-map-inner .leaflet-popup-pane{z-index:6;}
  .tp-map-inner .leaflet-top,.tp-map-inner .leaflet-bottom{z-index:7;}

  /* ETA chip */
  .tp-eta-chip{
    position:absolute;bottom:14px;left:22px;
    display:flex;align-items:center;gap:8px;
    background:var(--white);border:1px solid var(--divider);
    border-radius:12px;padding:8px 12px;
    box-shadow:0 2px 12px rgba(0,0,0,.10);
    z-index:8;animation:fadeIn .35s ease;pointer-events:none;
  }
  .tp-eta-van-dot{
    width:10px;height:10px;border-radius:50%;background:var(--accent);flex-shrink:0;
    box-shadow:0 0 0 3px rgba(0,102,204,.2);
    animation:livePulse 1.6s ease-in-out infinite;
  }
  .tp-eta-info{display:flex;flex-direction:column;gap:1px;}
  .tp-eta-time{font-size:14px;font-weight:700;color:var(--text1);letter-spacing:-.03em;line-height:1;}
  .tp-eta-sub{font-size:11px;color:var(--text2);letter-spacing:-.01em;}

  .tp-sidebar{
    flex:1;min-height:0;display:flex;flex-direction:column;
    overflow-y:auto;-webkit-overflow-scrolling:touch;
    background:var(--white);border-top:1px solid var(--divider);padding-bottom:80px;
  }

  /* DESKTOP */
  @media(min-width:768px){
    .tp-page{background:var(--bg2);}
    .tp-root{flex-direction:row;}
    .tp-sidebar{
      order:1;width:340px;min-width:340px;flex-shrink:0;
      height:100%;border-top:none;border-right:1px solid var(--divider);padding-bottom:0;
      background:var(--white);
    }
    .tp-map-wrap{order:2;flex:1;height:100%;padding:16px;}
    .tp-map-inner{border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,.08);}
    .tp-eta-chip{bottom:28px;left:28px;}
    .tp-cta-wrap{position:static!important;padding:0 20px 24px!important;background:transparent!important;border-top:none!important;}
    .tp-route-card{margin:0 20px;padding:14px 18px;}
    .tp-route-value{font-size:16px;}
    .tp-topbar{padding:20px 20px 0;}
    .tp-title-block{padding:14px 20px 0;}
    .tp-page-title{font-size:26px;}
    .tp-page-sub{font-size:13px;}
    .tp-stats-row{padding:0 20px;}
    .tp-section{padding:0 20px;}
    .tp-grid{padding:0 20px;}
    .tp-divider{margin:16px 0;}
  }

  .tp-topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 20px 0;flex-shrink:0;}
  .tp-live-badge{display:inline-flex;align-items:center;gap:5px;}
  .tp-live-badge--pulse{animation:badgePop .4s ease;}
  .tp-live-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:livePulse 2s ease-in-out infinite;}
  .tp-live-label{font-size:12px;font-weight:600;color:var(--green);letter-spacing:.02em;}
  .tp-sync-label{font-size:11px;color:var(--text2);letter-spacing:-.01em;}

  .tp-title-block{padding:10px 20px 0;flex-shrink:0;}
  .tp-page-title{font-size:22px;font-weight:700;color:var(--text1);letter-spacing:-.04em;line-height:1.15;margin-bottom:3px;}
  .tp-page-sub{font-size:12px;color:var(--text2);letter-spacing:-.01em;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

  .tp-divider{height:1px;background:var(--divider);margin:14px 0;flex-shrink:0;}

  .tp-route-card{
    margin:0 20px;
    background:linear-gradient(135deg,#EBF4FF 0%,#F0F7FF 100%);
    border:1px solid #C7DFFB;border-radius:14px;
    padding:14px 16px;display:flex;align-items:center;
    flex-shrink:0;animation:fadeIn .4s ease;
  }
  .tp-route-card--loading{background:var(--bg2);border-color:var(--divider);gap:10px;justify-content:center;}
  .tp-route-cell{flex:1;display:flex;flex-direction:column;gap:4px;min-width:0;}
  .tp-route-vr{width:1px;background:#C7DFFB;margin:0 12px;align-self:stretch;}
  .tp-route-label{font-size:10px;color:#5A7FA8;font-weight:600;letter-spacing:.07em;text-transform:uppercase;}
  .tp-route-value{font-size:15px;font-weight:700;color:var(--text1);letter-spacing:-.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .tp-route-value.tp-accent{color:var(--accent)!important;font-size:16px;}
  .tp-route-loading-dot{width:8px;height:8px;border-radius:50%;border:2px solid var(--divider);border-top-color:var(--accent);animation:spin .75s linear infinite;flex-shrink:0;}

  .tp-stats-row{display:flex;padding:0 20px;flex-shrink:0;}
  .tp-stat-cell{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0;}
  .tp-stat-vr{width:1px;background:var(--divider);margin:0 10px;flex-shrink:0;}
  .tp-stat-label{font-size:10px;color:var(--text2);font-weight:500;letter-spacing:.06em;text-transform:uppercase;}
  .tp-stat-value{font-size:13px;font-weight:600;color:var(--text1);letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

  .tp-section{padding:0 20px;flex-shrink:0;}
  .tp-section-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}

  .tp-field-label{display:block;font-size:10px;color:var(--text2);font-weight:500;letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px;}
  .tp-field-value{font-size:14px;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums;}
  .tp-field-primary{font-size:14px;font-weight:600;color:var(--text1);letter-spacing:-.02em;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .tp-field-secondary{font-size:12px;color:var(--text2);line-height:1.45;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

  .tp-battery-track{position:relative;height:5px;background:var(--bg2);border-radius:100px;border:1px solid var(--divider);overflow:visible;}
  .tp-battery-fill{height:100%;border-radius:100px;transition:width .8s cubic-bezier(.25,.46,.45,.94);}
  .tp-battery-nub{position:absolute;right:-4px;top:50%;transform:translateY(-50%);width:3px;height:9px;background:var(--divider);border-radius:0 2px 2px 0;}

  .tp-grid{display:grid;grid-template-columns:1fr 1fr;padding:0 20px;flex-shrink:0;}
  .tp-grid-cell{padding:0;min-width:0;}
  .tp-grid-cell:first-child{padding-right:12px;border-right:1px solid var(--divider);}
  .tp-grid-cell:last-child{padding-left:12px;}

  .tp-spacer{flex:1;}

  .tp-footer-info{
    margin:0 20px 16px;background:var(--bg2);border-radius:12px;
    padding:12px 14px;display:flex;flex-direction:column;gap:8px;flex-shrink:0;
  }
  .tp-footer-row{display:flex;justify-content:space-between;align-items:center;gap:8px;}
  .tp-footer-label{font-size:11px;color:var(--text2);font-weight:500;letter-spacing:.04em;text-transform:uppercase;flex-shrink:0;}
  .tp-footer-value{font-size:12px;color:var(--text1);font-weight:500;letter-spacing:-.01em;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

  .tp-cta-wrap{position:sticky;bottom:0;padding:12px 20px 20px;background:var(--white);border-top:1px solid var(--divider);flex-shrink:0;}
  .tp-call-btn{
    display:flex;align-items:center;justify-content:center;gap:8px;
    width:100%;padding:13px 0;background:var(--accent);color:var(--white);
    font-family:var(--font);font-size:15px;font-weight:600;letter-spacing:-.01em;
    text-decoration:none;border-radius:12px;
    -webkit-tap-highlight-color:transparent;transition:opacity .15s ease;
  }
  .tp-call-btn:hover{opacity:.84;}
  .tp-call-btn:active{opacity:.70;}

  .tp-accent{color:var(--accent)!important;}
  .tp-mono{font-family:var(--mono)!important;letter-spacing:.02em!important;}
`;

export default TrackingPage;
