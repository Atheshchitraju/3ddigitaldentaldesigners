import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";

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

interface Clinic {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
}

const clinics: Clinic[] = [
  {
    id: "jas-dental",
    name: "Jas Dental",
    address: "HSR Layout, Bengaluru",
    latitude: 12.920264,
    longitude: 77.643721,
    phone: "+91 9591111177",
  },
  {
    id: "excel-dental",
    name: "Excel Dental",
    address: "JP Nagar 7th Phase, Bengaluru",
    latitude: 12.889791,
    longitude: 77.586101,
    phone: "+91 8792801460",
  },
  {
    id: "girish-dental",
    name: "Girish Dental Clinic",
    address: "Wilson Garden, Bangalore",
    latitude: 12.945233,
    longitude: 77.594378,
    phone: "+91 9845988184",
  },
  {
    id: "tooth-align-clinic",
    name: "Tooth Align Clinic",
    address: "HSR Layout, Bengaluru",
    latitude: 12.894651,
    longitude: 77.611997,
    phone: "+91 9398753235",
  },
  {
    id: "house-of-teeth",
    name: "House Of Teeth",
    address: "Singasandra, Bangalore",
    latitude: 12.884874,
    longitude: 77.640394,
    phone: "+91 8105189978",
  },
  {
    id: "makers-of-smile",
    name: "Makers Of Smile",
    address: "Akshayanagar, Bengaluru",
    latitude: 12.867432,
    longitude: 77.618301,
    phone: "+91 7349137242",
  },
  {
    id: "dr-chaitana-dental-care",
    name: "Dr Chaitana's Dental Care",
    address: "Electronic City Phase 1, Bengaluru",
    latitude: 12.861,
    longitude: 77.677,
    phone: "+91 7353190690",
  },
  {
    id: "e-city-dental",
    name: "E City Dental",
    address: "Electronic City, Bengaluru",
    latitude: 12.845,
    longitude: 77.661,
    phone: "+91 9945529816",
  },
  {
    id: "all-about-teeth-dental-clinic",
    name: "All About Teeth",
    address: "Kadubeesanahalli, Bengaluru",
    latitude: 12.93,
    longitude: 77.686,
    phone: "+91 8296343683",
  },
  {
    id: "niranjans-dental",
    name: "Niranjan's Dental",
    address: "Jubilee Hills, Hyderabad",
    latitude: 17.432,
    longitude: 78.408,
    phone: "+91 9347196066",
  },
  {
    id: "mjb-dental-clinic",
    name: "MJB Dental Clinic",
    address: "Yousufguda, Hyderabad",
    latitude: 17.429,
    longitude: 78.427,
    phone: "+91 9885778820",
  },
  {
    id: "raj-dental-clinic",
    name: "Raj Dental Clinic and Implant Center",
    address: "Malleshwaram, Bengaluru",
    latitude: 12.999533,
    longitude: 77.570621,
    phone: "+91 7618704189",
  },
  {
    id: "sri-krishna-dental-health-care",
    name: "Sri Krishna Dental Health Care",
    address: "Uttarahalli, Bengaluru",
    latitude: 12.905643,
    longitude: 77.540331,
    phone: "+91 9113997388",
  },
  {
    id: "dr-raos-multispeciality-dental-clinic",
    name: "DR Rao's Multispeciality Dental Clinic",
    address: "HSR Layout, Bengaluru",
    latitude: 12.919427,
    longitude: 77.644118,
    phone: "+91 9008159445",
  },
  {
    id: "my-dentist-clinic",
    name: "My Dentist",
    address: "Neelasandra, Bengaluru",
    latitude: 12.954389,
    longitude: 77.613175,
    phone: "+91 7019551416",
  },
  {
    id: "cura-dental-clinic",
    name: "Cura Dental Clinic",
    address: "HSR Layout, Bengaluru",
    latitude: 12.912399,
    longitude: 77.637718,
    phone: "+91 8095303570",
  },
  {
    id: "dr-rubys-dental-care",
    name: "Dr Ruby's Dental Care",
    address: "BTM 1st Stage, Bengaluru",
    latitude: 12.919864,
    longitude: 77.60826,
    phone: "+91 8618513520",
  },
  {
    id: "toothlife-clinic",
    name: "TOOTHLIFE",
    address: "Haralur, Bengaluru",
    latitude: 12.899046,
    longitude: 77.656174,
    phone: "+91 8217707232",
  },
  {
    id: "the-tooth-corner",
    name: "The Tooth Corner",
    address: "Bellandur, Bengaluru",
    latitude: 12.927339,
    longitude: 77.66087,
    phone: "+91 8008816763",
  },
  {
    id: "tooth-tales",
    name: "Tooth Tales",
    address: "Arekere, Bengaluru",
    latitude: 12.883524,
    longitude: 77.604334,
    phone: "+91 7026935371",
  },
  {
    id: "prakash-dental-hospital",
    name: "PRAKASH DENTAL HOSPITAL",
    address: "Guntakal, Andhra Pradesh",
    latitude: 15.167,
    longitude: 77.383,
    phone: "+91 9848373504",
  },
  {
    id: "city-smiles-dental-clinic",
    name: "City Smiles Dental Clinic",
    address: "Akshayanagar, Bengaluru",
    latitude: 12.867,
    longitude: 77.618,
    phone: "+91 7619224720",
  },
  {
    id: "dental-decode",
    name: "Dental Decodé",
    address: "Rayasandra, Bengaluru",
    latitude: 12.852,
    longitude: 77.682,
    phone: "+91 9148164187",
  },
  {
    id: "care-and-cure-dental-clinic",
    name: "Care and Cure Dental Clinic",
    address: "Electronic City, Bengaluru",
    latitude: 12.858,
    longitude: 77.671,
    phone: "+91 9916299690",
  },
  {
    id: "sculptura-aesthetic-centre",
    name: "Sculptura Aesthetic Centre",
    address: "Jayanagar, Bengaluru",
    latitude: 12.919437,
    longitude: 77.580159,
    phone: "+91 9448933330",
  },
  {
    id: "smile-dental-care",
    name: "Smile Dental Care",
    address: "Electronic City, Bengaluru",
    latitude: 12.846832,
    longitude: 77.679756,
    phone: "+91 8123044110",
  },
  {
    id: "white-pearls-multispeciality-dental-clinic",
    name: "Dr Neethu's White Pearls",
    address: "Hullahalli, Begur, Bengaluru",
    latitude: 12.828376,
    longitude: 77.620778,
    phone: "+91 7483981229",
  },
  {
    id: "smile-dental-clinic-arekere",
    name: "Smile Dental Clinic",
    address: "Arekere, Bengaluru",
    latitude: 12.886588,
    longitude: 77.587053,
    phone: "+91 9148630602",
  },
  {
    id: "ma-dental-piler",
    name: "MA Dental",
    address: "Piler, Andhra Pradesh",
    latitude: 13.617304,
    longitude: 78.570909,
    phone: "+91 9515299307",
  },
];
function ChangeMapView({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], 15, {
      animate: true,
    });
  }, [lat, lng, map]);

  return null;
}
function BookScanner() {
  const [devices, setDevices] = useState<Device[]>([]);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [nearestScanner, setNearestScanner] = useState<Device | null>(null);

  const [searchClinic, setSearchClinic] = useState("");

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showNewClinicForm, setShowNewClinicForm] = useState(false);

  const [newClinic, setNewClinic] = useState({
    clinicName: "",
    doctorName: "",
    phone: "",
    address: "",
    city: "",
  });

  const filteredClinics = clinics.filter((clinic) =>
    clinic.name.toLowerCase().includes(searchClinic.toLowerCase()),
  );

  useEffect(() => {
    fetch("https://threeddigitaldentaldesigners.onrender.com/api/device")
      .then((res) => res.json())
      .then((data) => setDevices(data))
      .catch((err) => console.error(err));
  }, []);
  useEffect(() => {
    fetch("https://threeddigitaldentaldesigners.onrender.com/api/clinics")
      .then((res) => res.json())
      .then((data) => setClinics(data))
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
    if (!selectedDate || !selectedTime) {
      alert("Please select date and time");
      return;
    }

    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);

    if (selectedDateTime < new Date()) {
      alert("Please select a future date and time");
      return;
    }
    if (!selectedClinic) {
      alert("Please select a clinic");
      return;
    }

    const activeScanners = devices.filter(
      (scanner) => Date.now() - new Date(scanner.lastSeen).getTime() < 120000,
    );

    if (activeScanners.length === 0) {
      alert("No scanners available");
      return;
    }

    let nearest = activeScanners[0];
    let shortestDistance = Infinity;

    activeScanners.forEach((scanner) => {
      const distance = getDistance(
        selectedClinic.latitude,
        selectedClinic.longitude,
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
  const bookScanner = async () => {
    if (!selectedClinic) {
      alert("Please select a clinic");
      return;
    }

    if (!nearestScanner) {
      alert("Please find nearest scanner first");
      return;
    }

    try {
      const response = await fetch(
        "https://threeddigitaldentaldesigners.onrender.com/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clinicName: selectedClinic.name,
            clinicAddress: selectedClinic.address,
            phone: selectedClinic.phone,

            scannerId: nearestScanner.deviceId,
            scannerLocation: nearestScanner.city,

            bookingDate: selectedDate,
            bookingTime: selectedTime,

            status: "Pending",
          }),
        },
      );

      if (response.ok) {
        alert("Scanner booked successfully");
      } else {
        alert("Booking failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };
  const bookNewClinic = async () => {
    if (!newClinic.clinicName || !newClinic.doctorName || !newClinic.phone) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await fetch(
        "https://threeddigitaldentaldesigners.onrender.com/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clinicName: newClinic.clinicName,
            doctorName: newClinic.doctorName,
            phone: newClinic.phone,
            clinicAddress: newClinic.address,
            city: newClinic.city,

            bookingDate: selectedDate,
            bookingTime: selectedTime,

            isRegistered: false,
            status: "Pending",
          }),
        },
      );

      if (response.ok) {
        await fetch("https://threeddigitaldentaldesigners.onrender.com/api/clinics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newClinic.clinicName,
            address: newClinic.address,
            phone: newClinic.phone,
            doctorName: newClinic.doctorName,
            city: newClinic.city,
            latitude: 0,
            longitude: 0,
            isApproved: false,
          }),
        });

        alert("Clinic registration request submitted");

        setNewClinic({
          clinicName: "",
          doctorName: "",
          phone: "",
          address: "",
          city: "",
        });

        setShowNewClinicForm(false);
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen pt-32 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Book Scanner Service</h1>

        <p className="text-gray-600 mb-8">
          Find the nearest available scanner and schedule a visit.
        </p>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-lg border">
            <h2 className="text-2xl font-semibold mb-6">Find Nearest IntraOral Scanner</h2>

            <div className="relative mb-4">
              <input
                type="text"
                value={searchClinic}
                onChange={(e) => setSearchClinic(e.target.value)}
                placeholder="Search Clinic Name"
                className="w-full border rounded-xl p-3"
              />

              {searchClinic.length > 0 && selectedClinic?.name !== searchClinic && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-xl shadow-lg max-h-60 overflow-auto z-50">
                  {filteredClinics.map((clinic) => (
                    <div
                      key={clinic.id}
                      onClick={() => {
                        setSelectedClinic(clinic);
                        setSearchClinic(clinic.name);
                      }}
                      className="cursor-pointer p-3 hover:bg-gray-100"
                    >
                      {clinic.name}
                    </div>
                  ))}

                  {filteredClinics.length === 0 && (
                    <div className="p-3 border-t">
                      <button
                        type="button"
                        onClick={() => setShowNewClinicForm(true)}
                        className="text-blue-600 font-semibold"
                      >
                        + Register New Clinic
                      </button>
                    </div>
                  )}
                </div>
              )}
              {showNewClinicForm && (
                <div className="mt-4 space-y-3 rounded-xl border p-4 bg-gray-50">
                  <input
                    type="text"
                    placeholder="Clinic Name"
                    value={newClinic.clinicName}
                    onChange={(e) =>
                      setNewClinic({
                        ...newClinic,
                        clinicName: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2"
                  />

                  <input
                    type="text"
                    placeholder="Doctor Name"
                    value={newClinic.doctorName}
                    onChange={(e) =>
                      setNewClinic({
                        ...newClinic,
                        doctorName: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2"
                  />

                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={newClinic.phone}
                    onChange={(e) =>
                      setNewClinic({
                        ...newClinic,
                        phone: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2"
                  />

                  <input
                    type="text"
                    placeholder="Address"
                    value={newClinic.address}
                    onChange={(e) =>
                      setNewClinic({
                        ...newClinic,
                        address: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2"
                  />

                  <input
                    type="text"
                    placeholder="City"
                    value={newClinic.city}
                    onChange={(e) =>
                      setNewClinic({
                        ...newClinic,
                        city: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2"
                  />

                  <button
                    onClick={bookNewClinic}
                    className="w-full bg-green-600 text-white p-3 rounded-xl"
                  >
                    Submit Clinic Request
                  </button>
                </div>
              )}
            </div>

            {selectedClinic && (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                {nearestScanner && (
                  <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
                    <h3 className="font-bold text-green-700">Nearest Scanner</h3>

                    <p>{nearestScanner.deviceId}</p>

                    <p>{nearestScanner.city}</p>

                    <p className="font-semibold">
                      {Date.now() - new Date(nearestScanner.lastSeen).getTime() < 120000
                        ? "🟢 Online"
                        : "🔴 Offline"}
                    </p>
                  </div>
                )}
                <h3 className="font-bold">{selectedClinic.name}</h3>

                <p>{selectedClinic.address}</p>

                <p>{selectedClinic.phone}</p>
              </div>
            )}

            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border rounded-xl p-3 mb-4"
            />

            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full border rounded-xl p-3 mb-6"
            />
            <button
              onClick={findNearestScanner}
              disabled={!selectedClinic}
              className="w-full bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold"
            >
              Find Nearest Scanner
            </button>
          </div>

          <div className="lg:col-span-3 bg-white rounded-3xl shadow-lg border overflow-hidden">
            <MapContainer
              center={[selectedClinic?.latitude || 12.9716, selectedClinic?.longitude || 77.5946]}
              zoom={12}
              style={{
                height: "600px",
                width: "100%",
              }}
            >
              {selectedClinic && (
                <ChangeMapView lat={selectedClinic.latitude} lng={selectedClinic.longitude} />
              )}
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {userLocation && (
                <>
                  <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>📍 Your Current Location</Popup>
                  </Marker>

                  <Circle center={[userLocation.lat, userLocation.lng]} radius={300} />
                </>
              )}

              {selectedClinic && (
                <Marker position={[selectedClinic.latitude, selectedClinic.longitude]}>
                  <Popup>🏥 {selectedClinic.name}</Popup>
                </Marker>
              )}

              {devices
                .filter((device) => Date.now() - new Date(device.lastSeen).getTime() < 120000)
                .map((device) => (
                  <Marker key={device._id} position={[device.latitude, device.longitude]}>
                    <Popup>
                      <div>
                        <strong>{device.deviceId}</strong>
                        <br />
                        {device.city}
                        <br />
                        {Date.now() - new Date(device.lastSeen).getTime() < 120000
                          ? "🟢 Online"
                          : "🔴 Offline"}
                        <br />
                        Battery: {device.battery}%
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>

        {nearestScanner && (
          <div className="mt-8 rounded-3xl border border-green-300 bg-green-50 p-5">
            <h2 className="text-xl font-bold text-green-700">⭐ Nearest Scanner Found</h2>

            <p className="mt-2">Device: {nearestScanner.deviceId}</p>

            <p>Clinic: {nearestScanner.clinicName}</p>

            <p>City: {nearestScanner.city}</p>

            <p>Status: {nearestScanner.status}</p>

            <button className="mt-4 rounded-xl bg-green-600 px-5 py-3 text-white">
              Book This Scanner
            </button>
          </div>
        )}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Active Scanner Agents</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => {
              const isOnline = Date.now() - new Date(device.lastSeen).getTime() < 120000;

              return (
                <div key={device._id} className="bg-white border rounded-2xl p-5 shadow-md">
                  <h3 className="font-bold text-lg">{device.deviceId}</h3>

                  <p className="text-gray-600">{device.clinicName}</p>

                  <p>{device.city}</p>

                  <p>Battery: {device.battery}%</p>

                  <p className="font-semibold">{isOnline ? "🟢 Online" : "🔴 Offline"}</p>

                  <p className="text-sm text-gray-500">
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
