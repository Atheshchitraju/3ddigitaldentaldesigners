import { useEffect, useState } from "react";
import { getDevices } from "@/lib/deviceApi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function ScannerTracking() {
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    loadDevices();

    const interval = setInterval(loadDevices, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    const data = await getDevices();
    setDevices(data);
  };

  const firstDevice = devices[0];

  return (
    <div className="p-8">
      <br />
      <br />
      <br />
      <br />

      <h1 className="text-3xl font-bold mb-6">Scanner Tracking Dashboard</h1>

      {/* TABLE */}
      <div className="overflow-x-auto mb-10">
        <table className="w-full border rounded-xl">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">Device</th>
              <th className="p-3">Clinic</th>
              <th className="p-3">City</th>
              <th className="p-3">Battery</th>
              <th className="p-3">Status</th>
              <th className="p-3">Last Seen</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((device: any) => (
              <tr key={device.deviceId}>
                <td className="p-3">{device.deviceId}</td>
                <td className="p-3">{device.clinicName}</td>
                <td className="p-3">{device.city}</td>
                <td className="p-3">{device.battery}%</td>
                <td className="p-3">{device.status}</td>
                <td className="p-3">{new Date(device.lastSeen).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LIVE MAP */}
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

              <p>
                <strong>Status:</strong> {firstDevice.status}
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
  );
}
