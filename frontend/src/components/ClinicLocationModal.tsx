import { useEffect, useState } from "react";
import API_URL from "../config/api";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  open: boolean;
  clinic: any;
  onClose: () => void;
  onSaved: () => void;
}

function LocationPicker({
  position,
  setPosition,
}: {
  position: [number, number];
  setPosition: (value: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return <Marker position={position} />;
}

export default function ClinicLocationModal({ open, clinic, onClose, onSaved }: Props) {
  const [position, setPosition] = useState<[number, number]>([12.9716, 77.5946]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clinic) return;

    if (clinic.latitude !== 0 && clinic.longitude !== 0) {
      setPosition([clinic.latitude, clinic.longitude]);
    }
  }, [clinic]);

  if (!open || !clinic) return null;

  const saveLocation = async () => {
    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/api/clinics/location/${clinic._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: position[0],
          longitude: position[1],
        }),
      });

      if (!response.ok) {
        alert("Failed to save location");
        return;
      }

      alert("Location saved successfully");

      onSaved();

      onClose();
    } catch (error) {
      console.log(error);
      alert("Server error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-[900px] max-w-[95%] p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold">Set Clinic Location</h2>

          <button onClick={onClose} className="text-xl">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p>
            <strong>Clinic:</strong> {clinic.name}
          </p>

          <p>
            <strong>Address:</strong> {clinic.address}
          </p>
        </div>

        <MapContainer
          center={position}
          zoom={15}
          style={{
            height: "450px",
            width: "100%",
            borderRadius: "12px",
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="OpenStreetMap"
          />

          <LocationPicker position={position} setPosition={setPosition} />
        </MapContainer>

        <div className="mt-5">
          <p className="font-medium">Latitude : {position[0].toFixed(6)}</p>

          <p className="font-medium">Longitude : {position[1].toFixed(6)}</p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-3 rounded-xl border">
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={saveLocation}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white"
          >
            {saving ? "Saving..." : "Save Location"}
          </button>
        </div>
      </div>
    </div>
  );
}
