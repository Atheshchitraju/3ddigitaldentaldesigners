import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
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

function TrackingPage() {
  const { bookingId } = Route.useParams();

  const [booking, setBooking] = useState<Booking | null>(null);

  const [clinic, setClinic] = useState<Clinic | null>(null);

  const [scanner, setScanner] = useState<Device | null>(null);

  const [loading, setLoading] = useState(true);

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

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    loadTracking();

    const interval = setInterval(() => {
      loadTracking();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold animate-pulse">Loading Scanner...</div>
      </div>
    );
  }

  if (!booking || !clinic || !scanner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Tracking information not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white p-6 shadow-xl">
        <h1 className="text-3xl font-bold">🚐 Live Scanner Tracking</h1>

        <p className="opacity-90 mt-2">Your scanner is on the way.</p>
      </div>

      <div className="grid lg:grid-cols-4">
        <div className="lg:col-span-3">
          <MapContainer
            center={[
              (clinic.latitude + scanner.latitude) / 2,
              (clinic.longitude + scanner.longitude) / 2,
            ]}
            zoom={13}
            style={{
              height: "calc(100vh - 96px)",
              width: "100%",
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <Marker position={[clinic.latitude, clinic.longitude]}>
              <Popup>🏥 {clinic.name}</Popup>
            </Marker>

            <Marker position={[scanner.latitude, scanner.longitude]}>
              <Popup>🚐 {scanner.deviceId}</Popup>
            </Marker>

            <Polyline
              positions={[
                [scanner.latitude, scanner.longitude],
                [clinic.latitude, clinic.longitude],
              ]}
            />
          </MapContainer>
        </div>

        <div className="bg-white shadow-xl p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Scanner Details</h2>
          </div>

          <div className="rounded-2xl bg-blue-50 p-5">
            <p className="text-gray-500">Scanner ID</p>

            <h3 className="text-2xl font-bold">{scanner.deviceId}</h3>
          </div>

          <div className="rounded-2xl bg-green-50 p-5">
            <p className="text-gray-500">Battery</p>

            <h3 className="text-3xl font-bold text-green-600">🔋 {scanner.battery}%</h3>
          </div>

          <div className="rounded-2xl bg-yellow-50 p-5">
            <p className="text-gray-500">Status</p>

            <h3 className="text-2xl font-bold text-blue-600">{scanner.status}</h3>
          </div>

          <div className="rounded-2xl bg-gray-50 p-5">
            <p className="text-gray-500">Current City</p>

            <h3 className="text-xl font-semibold">{scanner.city}</h3>
          </div>

          <div className="rounded-2xl bg-gray-50 p-5">
            <p className="text-gray-500">Destination</p>

            <h3 className="text-xl font-semibold">{clinic.name}</h3>

            <p className="text-sm mt-2">{clinic.address}</p>
          </div>

          <div className="rounded-2xl bg-indigo-50 p-5">
            <p className="text-gray-500">Booking</p>

            <h3 className="font-semibold">{booking.bookingDate}</h3>

            <h3 className="font-semibold">{booking.bookingTime}</h3>
          </div>

          <a
            href={`tel:${clinic.phone}`}
            className="block text-center bg-green-600 hover:bg-green-700 transition text-white font-bold py-4 rounded-2xl"
          >
            📞 Call Clinic
          </a>

          <div className="text-center text-sm text-gray-500">
            Last Updated
            <br />
            {new Date(scanner.lastSeen).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackingPage;
