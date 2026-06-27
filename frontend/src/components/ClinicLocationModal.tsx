import { useEffect, useState } from "react";
import API_URL from "../config/api";
import { MapContainer, Marker, TileLayer, useMapEvents, useMap } from "react-leaflet";
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

function ChangeMapView({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 16);
  }, [position]);

  return null;
}

function LocationPicker({
  position,
  setPosition,
  setLatitude,
  setLongitude,
}: {
  position: [number, number];
  setPosition: (value: [number, number]) => void;
  setLatitude: (value: string) => void;
  setLongitude: (value: string) => void;
}) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      setPosition([lat, lng]);

      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
    },
  });

  return <Marker position={position} />;
}

export default function ClinicLocationModal({ open, clinic, onClose, onSaved }: Props) {
  const [position, setPosition] = useState<[number, number]>([12.9716, 77.5946]);

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [saving, setSaving] = useState(false);

  const searchAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      );

      const data = await response.json();

      if (data.length > 0) {
        const lat = Number(data[0].lat);
        const lng = Number(data[0].lon);

        setPosition([lat, lng]);
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!clinic) return;

    if (clinic.latitude && clinic.longitude && clinic.latitude !== 0 && clinic.longitude !== 0) {
      setPosition([clinic.latitude, clinic.longitude]);

      setLatitude(String(clinic.latitude));
      setLongitude(String(clinic.longitude));
    } else {
      searchAddress(clinic.address);
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
          latitude: Number(latitude),
          longitude: Number(longitude),
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

        <div className="mb-5">
          <p>
            <strong>Clinic:</strong> {clinic.name}
          </p>

          <p>
            <strong>Address:</strong> {clinic.address}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="font-semibold">Latitude</label>

            <input
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) => {
                const value = e.target.value;

                setLatitude(value);

                const lat = parseFloat(value);
                const lng = parseFloat(longitude);

                if (!isNaN(lat) && !isNaN(lng)) {
                  setPosition([lat, lng]);
                }
              }}
              className="w-full mt-2 border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="font-semibold">Longitude</label>

            <input
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) => {
                const value = e.target.value;

                setLongitude(value);

                const lat = parseFloat(latitude);
                const lng = parseFloat(value);

                if (!isNaN(lat) && !isNaN(lng)) {
                  setPosition([lat, lng]);
                }
              }}
              className="w-full mt-2 border rounded-xl p-3"
            />
          </div>
        </div>

        <MapContainer
          center={position}
          zoom={16}
          style={{
            height: "450px",
            width: "100%",
            borderRadius: "16px",
          }}
        >
          <ChangeMapView position={position} />

          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationPicker
            position={position}
            setPosition={setPosition}
            setLatitude={setLatitude}
            setLongitude={setLongitude}
          />
        </MapContainer>

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
