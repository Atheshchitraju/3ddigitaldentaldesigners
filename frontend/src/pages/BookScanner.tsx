import { createFileRoute } from "@tanstack/react-router";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";

export const Route = createFileRoute("/book-scanner")({
  component: BookScanner,
});

function BookScanner() {
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

            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">
              Find Scanner
            </button>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-lg border overflow-hidden">
            <div className="h-[600px] flex items-center justify-center text-gray-500">
              <MapContainer
                center={[12.9716, 77.5946]}
                zoom={11}
                style={{
                  height: "600px",
                  width: "100%",
                }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
