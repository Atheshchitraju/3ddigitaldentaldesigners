import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";

export const Route = createFileRoute("/book-scanner")({
  component: BookScanner,
});

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
}

function BookScanner() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [nearestScanner, setNearestScanner] = useState<Device | null>(null);

  useEffect(() => {
    fetch("https://threeddigitaldentaldesigners.onrender.com/api/device")
      .then((res) => res.json())
      .then((data) => setDevices(data))
      .catch((err) => console.error(err));
  }, []);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.error(err);
        alert("Please allow location access");
      },
    );
  }, []);

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
  const findNearestScanner = () => {
    if (!userLocation || devices.length === 0) return;

    let nearest = devices[0];
    let shortestDistance = Infinity;

    devices.forEach((scanner) => {
      const distance = getDistance(
        userLocation.lat,
        userLocation.lng,
        scanner.latitude,
        scanner.longitude,
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearest = scanner;
      }
    });

    setNearestScanner(nearest);
  };

  return (
    <div className="min-h-screen pt-32 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Book Scanner Service</h1>

        <p className="text-gray-600 mb-8">
          Find the nearest available scanner and schedule a visit.
        </p>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-lg border">
            <h2 className="text-2xl font-semibold mb-6">Find Nearest Scanner</h2>

            <input
              type="text"
              placeholder="Enter Clinic Address"
              className="w-full border rounded-xl p-3 mb-4"
            />

            <input type="date" className="w-full border rounded-xl p-3 mb-4" />

            <input type="time" className="w-full border rounded-xl p-3 mb-6" />

            <button
              onClick={findNearestScanner}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
            >
              Find Nearest Scanner
            </button>
          </div>

          {/* Map */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-lg border overflow-hidden">
            <MapContainer
              center={[12.9716, 77.5946]}
              zoom={11}
              style={{
                height: "600px",
                width: "100%",
              }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {userLocation && (
                <>
                  <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>📍 Your Location</Popup>
                  </Marker>

                  <Circle center={[userLocation.lat, userLocation.lng]} radius={300} />
                </>
              )}

              {devices.map((device) => (
                <Marker key={device._id} position={[device.latitude, device.longitude]}>
                  <Popup>
                    <div>
                      <strong>{device.deviceId}</strong>
                      <br />
                      {device.city}
                      <br />
                      Status: {device.status}
                      <br />
                      Battery: {device.battery}%
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Scanner Cards */}
        <div className="mt-8">
          {nearestScanner && (
            <div className="mb-6 rounded-3xl border border-green-300 bg-green-50 p-5">
              <h2 className="text-xl font-bold text-green-700">⭐ Nearest Scanner Found</h2>

              <p className="mt-2">Device: {nearestScanner.deviceId}</p>

              <p>City: {nearestScanner.city}</p>

              <p>Status: {nearestScanner.status}</p>

              <button className="mt-4 rounded-xl bg-green-600 px-5 py-3 text-white">
                Book This Scanner
              </button>
            </div>
          )}
          <h2 className="text-2xl font-bold mb-4">Available Scanners</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => {
              const isOffline = Date.now() - new Date(device.lastSeen).getTime() > 120000;

              return (
                <div key={device._id} className="bg-white border rounded-2xl p-5 shadow-md">
                  <h3 className="font-bold text-lg">{device.deviceId}</h3>

                  <p className="text-gray-600">{device.city}</p>

                  <p className="mt-2">Battery: {device.battery}%</p>

                  <p className="mt-2 font-medium">{isOffline ? "🔴 Offline" : "🟢 Available"}</p>

                  <p className="text-sm text-gray-500 mt-2">
                    Last Seen: {new Date(device.lastSeen).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookScanner;
