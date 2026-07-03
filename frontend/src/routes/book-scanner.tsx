import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import logo from "../assets/3D.webp";

export const Route = createFileRoute("/book-scanner")({
  component: BookScanner,
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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
  phone?: string;
}

interface Clinic {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
}

/**
 * A Booking represents a "Scanner Visit" — the central appointment record.
 * A scanner + operator are resources assigned to it, not the other way round.
 */
type BookingStatus =
  | "Queued"
  | "Pending"
  | "Assigned"
  | "On the Way"
  | "Reached"
  | "Scanning"
  | "Completed"
  | "Cancelled";

interface Booking {
  _id: string;
  clinicName: string;
  clinicAddress: string;
  phone: string;
  scannerId: string | null;
  scannerLocation: string | null;
  bookingDate: string;
  bookingTime: string;
  status: BookingStatus;
  queuePosition: number | null;
}

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */

const ONLINE_THRESHOLD_MS = 120000; // 2 minutes

function isOnline(lastSeen: string) {
  return Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;
}

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

/** Bookings that still occupy a scanner slot (not cancelled/completed). */
function getActiveSlotBookings(bookings: Booking[], date: string, time: string) {
  return bookings.filter(
    (b) =>
      b.bookingDate === date &&
      b.bookingTime === time &&
      b.status !== "Cancelled" &&
      b.status !== "Completed",
  );
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

/**
 * A "pre-booking" is any booking made for a future date (e.g. tomorrow).
 * For pre-bookings we don't require the scanner to be online right now —
 * it just needs to exist. It will be dispatched on the scheduled day.
 */
function isPreBookingDate(date: string) {
  if (!date) return false;
  return date > getTodayStr();
}

/**
 * The pool of scanners that can be considered for a given date.
 * - Today (real-time dispatch): only scanners currently online. An
 *   offline scanner can't be sent out right now, so it isn't offered as
 *   an alternative even if it technically has no booking yet.
 * - Future dates (pre-booking): every registered scanner counts, since a
 *   scanner doesn't need to be online today to be reserved for tomorrow.
 */
function getScannerPool(devices: Device[], date: string) {
  return isPreBookingDate(date) ? devices : devices.filter((d) => isOnline(d.lastSeen));
}

type SlotStatus = "Available" | "Booked" | "Queue";

interface SlotAvailability {
  /** Scanners eligible for this date (online-only for today, all for pre-booking). */
  pool: Device[];
  /** Scanners in the pool not yet assigned to this exact date + time. */
  freeScanners: Device[];
  status: SlotStatus;
  /** How many requests are already queued past capacity, if status is "Queue". */
  queueCount: number;
}

/**
 * Single source of truth for "is this slot bookable, and with which scanner?"
 * Used by both the time-slot grid (for status/colour) and the
 * find-nearest-scanner flow (for actually picking a free scanner), so the
 * two can never disagree with each other.
 *
 * - Available: at least one eligible scanner is still unassigned for this
 *   date + time (e.g. scanner 1 is booked, scanner 2 is free -> Available,
 *   and scanner 2 is the one offered).
 * - Booked: every eligible scanner is already assigned to this exact slot.
 * - Queue: more requests exist for this slot than there are eligible
 *   scanners, so any further request joins a queue instead.
 */
function getSlotAvailability(
  devices: Device[],
  bookings: Booking[],
  date: string,
  time: string,
): SlotAvailability {
  const pool = getScannerPool(devices, date);
  const slotBookings = getActiveSlotBookings(bookings, date, time);
  const assignedScannerIds = new Set(slotBookings.map((b) => b.scannerId).filter(Boolean));
  const freeScanners = pool.filter((scanner) => !assignedScannerIds.has(scanner.deviceId));

  let status: SlotStatus = "Available";
  let queueCount = 0;

  if (pool.length > 0 && freeScanners.length === 0) {
    if (slotBookings.length > pool.length) {
      status = "Queue";
      queueCount = slotBookings.length - pool.length;
    } else {
      status = "Booked";
    }
  }

  return { pool, freeScanners, status, queueCount };
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
  {
    id: "tooth-comforts",
    name: "Tooth Comforts",
    address: "Uttarahalli, Bengaluru",
    latitude: 12.911769,
    longitude: 77.480756,
    phone: "+91 9886373263",
  },
  {
    id: "ayesha-dental-clinic",
    name: "AYESHA DENTAL CLINIC",
    address: "Bommanahalli, Bengaluru",
    latitude: 12.907236,
    longitude: 77.626825,
    phone: "+91 9342235245",
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
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [showAnimation, setShowAnimation] = useState(false);

  const [bookingDetails, setBookingDetails] = useState<{
    scanner: Device | null;
    booking: Booking;
    queuePosition: number | null;
  } | null>(null);

  const [searchClinic, setSearchClinic] = useState("");

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
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
    fetch("https://threeddigitaldentaldesigners.onrender.com/api/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch(console.error);
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

  /**
   * Looks at the scanner pool for the chosen date (online-only for today,
   * every registered scanner for future "pre-booking" dates), works out
   * which of them are already committed to the chosen date/time, and
   * either:
   *  - assigns the nearest scanner that is still free for that slot, or
   *  - puts the visit in a queue and reports the clinic's queue position.
   */
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

    const { pool, freeScanners, status, queueCount } = getSlotAvailability(
      devices,
      bookings,
      selectedDate,
      selectedTime,
    );

    // No eligible scanners at all (pre-booking: none registered; same-day:
    // none online) -> straight into the queue.
    if (pool.length === 0) {
      setNearestScanner(null);
      setQueuePosition(getActiveSlotBookings(bookings, selectedDate, selectedTime).length + 1);
      return;
    }

    // Every eligible scanner is already committed for this slot -> queue.
    // (With a single scanner, this means the very next request for the same
    // slot is queued — that scanner is fully booked. With a second scanner
    // that's still free, we never reach this branch — see below.)
    if (status === "Booked" || status === "Queue") {
      setNearestScanner(null);
      setQueuePosition(queueCount + 1);
      return;
    }

    // At least one scanner is free for this slot — pick the closest one to
    // the clinic. (2-scanner example: scanner 1 already booked, scanner 2
    // free -> scanner 2 is the only candidate and gets offered here.)
    let nearest = freeScanners[0];
    let shortestDistance = Infinity;

    freeScanners.forEach((scanner) => {
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
    setQueuePosition(null);
  };

  const bookScanner = async () => {
    if (!selectedClinic) {
      alert("Please select a clinic");
      return;
    }

    if (!nearestScanner && queuePosition === null) {
      alert("Please find nearest scanner first");
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert("Please select booking date and time");
      return;
    }

    const isQueued = queuePosition !== null;

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

            scannerId: nearestScanner?.deviceId ?? null,
            scannerLocation: nearestScanner?.city ?? null,

            bookingDate: selectedDate,
            bookingTime: selectedTime,

            status: isQueued ? "Queued" : "Assigned",
            queuePosition: isQueued ? queuePosition : null,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();

        alert(data.message);

        return;
      }

      const booking: Booking = await response.json();

      setBookingDetails({
        scanner: nearestScanner,
        booking,
        queuePosition: isQueued ? queuePosition : null,
      });

      setShowAnimation(true);

      setTimeout(() => {
        setShowAnimation(false);

        setBookingSuccess(true);
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };
  const bookNewClinic = async () => {
    if (!newClinic.clinicName || !newClinic.doctorName || !newClinic.phone || !newClinic.address) {
      alert("Please fill all required fields");
      return;
    }

    try {
      // Register clinic only once
      const clinicResponse = await fetch(
        "https://threeddigitaldentaldesigners.onrender.com/api/clinics",
        {
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
        },
      );

      if (!clinicResponse.ok) {
        alert("Failed to register clinic");
        return;
      }

      const createdClinic = await clinicResponse.json();

      const clinic: Clinic = {
        id: createdClinic._id,
        name: createdClinic.name,
        address: createdClinic.address,
        latitude: createdClinic.latitude,
        longitude: createdClinic.longitude,
        phone: createdClinic.phone,
      };

      // Add newly registered clinic to dropdown
      setClinics((prev) => [...prev, clinic]);

      // Automatically select clinic
      setSelectedClinic(clinic);

      // Fill search box
      setSearchClinic(clinic.name);

      // Reset form
      setNewClinic({
        clinicName: "",
        doctorName: "",
        phone: "",
        address: "",
        city: "",
      });

      setShowNewClinicForm(false);

      alert(
        "✅ Clinic registered successfully.\n\nNow select date & time and click Find Nearest Scanner.",
      );
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };
  if (showAnimation) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white via-blue-50 to-white flex flex-col items-center justify-center z-[9999]">
        <img src={logo} alt="3D Digital Dental Designers" className="w-44 animate-bounce" />

        <h1 className="mt-8 text-4xl font-bold text-blue-700">Booking Your Scanner</h1>

        <p className="mt-3 text-lg text-gray-500">
          Please wait while we assign the nearest scanner...
        </p>

        <div className="w-80 h-3 bg-gray-200 rounded-full overflow-hidden mt-10">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{
              animation: "loadingBar 2s linear forwards",
            }}
          />
        </div>

        <style>{`
        @keyframes loadingBar{
          from{width:0%;}
          to{width:100%;}
        }
      `}</style>
      </div>
    );
  }
  if (bookingSuccess && bookingDetails) {
    const isQueued = bookingDetails.queuePosition !== null;
    const isPreBooked = !isQueued && isPreBookingDate(bookingDetails.booking.bookingDate);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
          {/* Header */}

          <div
            className={`p-10 text-center text-white ${
              isQueued
                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                : isPreBooked
                  ? "bg-gradient-to-r from-purple-600 to-indigo-500"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500"
            }`}
          >
            <img src={logo} className="w-32 mx-auto mb-5 animate-bounce" />

            <div className="text-7xl mb-4">{isQueued ? "🕒" : isPreBooked ? "📅" : "✅"}</div>

            <h1 className="text-4xl font-bold">
              {isQueued
                ? "Visit Added to Queue"
                : isPreBooked
                  ? "Scanner Pre-Booked Successfully"
                  : "Scanner Booked Successfully"}
            </h1>

            <p className="mt-3 text-blue-100">
              {isQueued
                ? "All nearby scanners are busy for this slot. You'll be assigned automatically as soon as one is free."
                : isPreBooked
                  ? `Your scanner is reserved for ${bookingDetails.booking.bookingDate} at ${bookingDetails.booking.bookingTime}. It will reach your clinic at the scheduled time.`
                  : "Our scanner will reach your clinic shortly."}
            </p>
          </div>

          {/* Booking Details */}

          <div className="p-8 space-y-5">
            {isQueued ? (
              <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-6 text-center">
                <p className="text-gray-600">Your Queue Position</p>
                <h2 className="text-5xl font-bold text-yellow-600">
                  {bookingDetails.queuePosition}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Admin will assign the next available scanner to this visit.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-500">Scanner ID</p>

                    <h2 className="text-2xl font-bold">{bookingDetails.scanner?.deviceId}</h2>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-500">Battery</p>

                    <h2 className="text-2xl font-bold text-green-600">
                      {bookingDetails.scanner?.battery}%
                    </h2>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-500">Current Location</p>

                    <h2 className="text-xl font-semibold">{bookingDetails.scanner?.city}</h2>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-500">Status</p>

                    <h2 className="text-xl font-semibold text-green-600">
                      {isPreBooked ? "📅 Pre-Booked" : bookingDetails.booking.status}
                    </h2>
                  </div>
                </div>
              </>
            )}

            <hr />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Clinic</span>

                <strong>{selectedClinic?.name}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Booking Date</span>

                <strong>{selectedDate}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Booking Time</span>

                <strong>{selectedTime}</strong>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-5">
              <a
                href={`tel:${bookingDetails.scanner?.phone || selectedClinic?.phone}`}
                className="bg-green-600 hover:bg-green-700 transition text-white text-center py-4 rounded-2xl font-bold text-lg"
              >
                📞 {isQueued ? "Call Support" : "Call Scanner"}
              </a>

              <button
                onClick={() =>
                  navigate({
                    to: "/tracking/$bookingId",
                    params: {
                      bookingId: bookingDetails.booking._id,
                    },
                  })
                }
                disabled={isQueued || isPreBooked}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-white py-4 rounded-2xl font-bold text-lg"
              >
                📍{" "}
                {isQueued
                  ? "Tracking Unavailable"
                  : isPreBooked
                    ? "Tracking Starts on Visit Day"
                    : "Track Scanner"}
              </button>
            </div>

            <button
              onClick={() => {
                setBookingSuccess(false);

                setBookingDetails(null);

                setNearestScanner(null);
                setQueuePosition(null);

                setSelectedClinic(null);

                setSearchClinic("");

                setSelectedDate("");

                setSelectedTime("");
              }}
              className="w-full mt-5 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-4 rounded-2xl font-bold"
            >
              Book Another Scanner
            </button>
          </div>
        </div>
      </div>
    );
  }
  const timeSlots: string[] = [];

  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      timeSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    }
  }

  const preBooking = isPreBookingDate(selectedDate);

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
                      {preBooking
                        ? `📅 Reserved for ${selectedDate}`
                        : isOnline(nearestScanner.lastSeen)
                          ? "🟢 Online"
                          : "🔴 Offline"}
                    </p>
                  </div>
                )}

                {queuePosition !== null && (
                  <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
                    <h3 className="font-bold text-yellow-700">🕒 All Nearby Scanners Busy</h3>
                    <p>
                      Your visit will be <strong>Queue Position {queuePosition}</strong> for this
                      slot.
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
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime("");
                setNearestScanner(null);
                setQueuePosition(null);
              }}
              className="w-full border rounded-xl p-3 mb-4"
            />

            {preBooking && (
              <div className="mb-4 rounded-xl border border-purple-300 bg-purple-50 p-3 text-sm text-purple-700 font-semibold">
                📅 Pre-Booking — every registered scanner is available for this date, even if it
                isn't online right now. It will be dispatched on the scheduled day.
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Available Time Slots</h3>

              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {timeSlots.map((slot) => {
                  // Same shared logic used by "Find Nearest Scanner": a
                  // slot only turns Booked once every eligible scanner is
                  // assigned. A free 2nd scanner keeps it Available.
                  const { status, queueCount: queue } = getSlotAvailability(
                    devices,
                    bookings,
                    selectedDate,
                    slot,
                  );

                  return (
                    <button
                      key={slot}
                      disabled={status === "Booked"}
                      onClick={() => {
                        setSelectedTime(slot);
                        setNearestScanner(null);
                        setQueuePosition(null);
                      }}
                      className={`rounded-xl p-3 border text-sm font-semibold transition

          ${
            selectedTime === slot
              ? "bg-blue-600 text-white border-blue-600"
              : status === "Available"
                ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                : status === "Booked"
                  ? "bg-red-50 border-red-300 text-red-600 cursor-not-allowed"
                  : "bg-yellow-50 border-yellow-300 text-yellow-700"
          }`}
                    >
                      <div>{slot}</div>

                      <div className="text-xs mt-1">
                        {status === "Available" && "🟢 Available"}
                        {status === "Booked" && "🔴 Booked"}
                        {status === "Queue" && `🟡 Queue (${queue})`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={findNearestScanner}
              disabled={!selectedClinic || !selectedDate || !selectedTime}
              className="w-full bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold"
            >
              {preBooking ? "Find Scanner for Pre-Booking" : "Find Nearest Scanner"}
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

              {(preBooking ? devices : devices.filter((device) => isOnline(device.lastSeen))).map(
                (device) => (
                  <Marker key={device._id} position={[device.latitude, device.longitude]}>
                    <Popup>
                      <div>
                        <strong>{device.deviceId}</strong>
                        <br />
                        {device.city}
                        <br />
                        {isOnline(device.lastSeen) ? "🟢 Online" : "🔴 Offline"}
                        <br />
                        Battery: {device.battery}%
                      </div>
                    </Popup>
                  </Marker>
                ),
              )}
            </MapContainer>
          </div>
        </div>

        {(nearestScanner || queuePosition !== null) && (
          <div
            className={`mt-8 rounded-3xl border p-5 ${
              queuePosition !== null
                ? "border-yellow-300 bg-yellow-50"
                : "border-green-300 bg-green-50"
            }`}
          >
            {nearestScanner ? (
              <>
                <h2 className="text-xl font-bold text-green-700">
                  {preBooking ? "📅 Scanner Reserved for Pre-Booking" : "⭐ Nearest Scanner Found"}
                </h2>

                <p className="mt-2">Device: {nearestScanner.deviceId}</p>

                <p>Clinic: {nearestScanner.clinicName}</p>

                <p>City: {nearestScanner.city}</p>

                <p>Status: {nearestScanner.status}</p>

                {preBooking && (
                  <p className="mt-1 text-sm text-purple-700">
                    This scanner is pre-booked for {selectedDate} at {selectedTime} — it doesn't
                    need to be online today.
                  </p>
                )}

                <button
                  onClick={bookScanner}
                  className="mt-4 rounded-xl bg-green-600 px-5 py-3 text-white"
                >
                  {preBooking ? "Confirm Pre-Booking" : "Book This Scanner"}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-yellow-700">
                  🕒 All Scanners Busy — Queue Position {queuePosition}
                </h2>

                <p className="mt-2 text-gray-600">
                  {preBooking
                    ? "Every registered scanner is already pre-booked for this slot. You'll still get a confirmed visit slot; a scanner will be assigned automatically as soon as one frees up."
                    : "You'll still get a confirmed visit slot; a scanner will be assigned to it automatically as soon as one becomes free."}
                </p>

                <button
                  onClick={bookScanner}
                  className="mt-4 rounded-xl bg-yellow-500 px-5 py-3 text-white font-semibold"
                >
                  Join Queue
                </button>
              </>
            )}
          </div>
        )}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Active Scanner Agents</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => {
              const online = isOnline(device.lastSeen);

              return (
                <div key={device._id} className="bg-white border rounded-2xl p-5 shadow-md">
                  <h3 className="font-bold text-lg">{device.deviceId}</h3>

                  <p className="text-gray-600">{device.clinicName}</p>

                  <p>{device.city}</p>

                  <p>Battery: {device.battery}%</p>

                  <p className="font-semibold">{online ? "🟢 Online" : "🔴 Offline"}</p>

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
