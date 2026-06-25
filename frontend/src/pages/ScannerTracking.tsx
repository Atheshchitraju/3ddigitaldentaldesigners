import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getDevices } from "@/lib/deviceApi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function ScannerTracking() {
  const [devices, setDevices] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadDevices();

    const interval = setInterval(loadDevices, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    const data = await getDevices();

    setDevices(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");

    navigate({
      to: "/admin/login",
    });
  };

  const firstDevice = devices[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-7xl mx-auto">
        <br />
        <br />
        <br />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">Scanner Tracking Dashboard</h1>

            <p className="text-gray-500 mt-2">Monitor all active scanner agents</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                navigate({
                  to: "/admin/orders",
                })
              }
              className="bg-blue-600 text-white px-5 py-3 rounded-xl"
            >
              Orders
            </button>

            <button
              onClick={() =>
                navigate({
                  to: "/admin/bookings",
                })
              }
              className="bg-purple-600 text-white px-5 py-3 rounded-xl"
            >
              Scanner Bookings
            </button>

            <button className="bg-cyan-600 text-white px-5 py-3 rounded-xl">Active Scanners</button>

            <button
              onClick={() =>
                navigate({
                  to: "/admin/clinics",
                })
              }
              className="bg-orange-600 text-white px-5 py-3 rounded-xl"
            >
              Clinics
            </button>

            <button onClick={handleLogout} className="bg-red-500 text-white px-5 py-3 rounded-xl">
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border rounded-2xl p-5">
            <p className="text-gray-500 text-sm">Total Scanners</p>

            <h2 className="text-3xl font-bold mt-2">{devices.length}</h2>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-gray-500 text-sm">Online</p>

            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {devices.filter((d) => Date.now() - new Date(d.lastSeen).getTime() < 120000).length}
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-gray-500 text-sm">Offline</p>

            <h2 className="text-3xl font-bold text-red-600 mt-2">
              {devices.filter((d) => Date.now() - new Date(d.lastSeen).getTime() > 120000).length}
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-gray-500 text-sm">Cities</p>

            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {new Set(devices.map((d) => d.city)).size}
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto mb-10 bg-white rounded-2xl border shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left">Device</th>

                <th className="p-4 text-left">Clinic</th>

                <th className="p-4 text-left">City</th>

                <th className="p-4 text-left">Battery</th>

                <th className="p-4 text-left">Status</th>

                <th className="p-4 text-left">Last Seen</th>
              </tr>
            </thead>

            <tbody>
              {devices.map((device: any) => (
                <tr key={device.deviceId} className="border-t">
                  <td className="p-4">{device.deviceId}</td>

                  <td className="p-4">{device.clinicName}</td>

                  <td className="p-4">{device.city}</td>

                  <td className="p-4">{device.battery}%</td>

                  <td className="p-4">
                    {Date.now() - new Date(device.lastSeen).getTime() < 120000 ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        🟢 Online
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">
                        🔴 Offline
                      </span>
                    )}
                  </td>

                  <td className="p-4">{new Date(device.lastSeen).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {firstDevice && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Live Scanner Location</h2>

            <div className="bg-white border rounded-xl p-4 shadow">
              <div className="mb-4">
                <p>
                  <strong>Device:</strong> {firstDevice.deviceId}
                </p>

                <p>
                  <strong>Clinic:</strong> {firstDevice.clinicName}
                </p>

                <p>
                  <strong>City:</strong> {firstDevice.city}
                </p>
              </div>

              <MapContainer
                center={[firstDevice.latitude, firstDevice.longitude]}
                zoom={15}
                style={{
                  height: "500px",
                  width: "100%",
                  borderRadius: "16px",
                }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[firstDevice.latitude, firstDevice.longitude]}>
                  <Popup>
                    <div>
                      <strong>{firstDevice.deviceId}</strong>

                      <br />

                      {firstDevice.clinicName}

                      <br />

                      {firstDevice.city}
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
