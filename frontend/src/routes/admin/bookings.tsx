import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import API_URL from "../../config/api";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate({
        to: "/admin/login",
      });

      return;
    }

    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bookings`);

      const data = await response.json();

      setBookings(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");

    navigate({
      to: "/admin/login",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-7xl mx-auto">
        <br />
        <br />
        <br />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#111827]">Scanner Management</h1>

            <p className="text-gray-500 mt-2">Registered scanners in system</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate({ to: "/admin/orders" })}
              className="bg-blue-600 text-white px-5 py-3 rounded-xl font-medium"
            >
              Orders
            </button>

            <button
              onClick={() => navigate({ to: "/admin/bookings" })}
              className="bg-purple-600 text-white px-5 py-3 rounded-xl font-medium"
            >
              Scanner Bookings
            </button>

            <button
              onClick={() => navigate({ to: "/admin/scanners" })}
              className="bg-cyan-600 text-white px-5 py-3 rounded-xl font-medium"
            >
              Active Scanners
            </button>

            <button className="bg-orange-600 text-white px-5 py-3 rounded-xl font-medium">
              Clinics
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-5 py-3 rounded-xl font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Total Bookings</p>

            <h2 className="text-3xl font-bold mt-2">{bookings.length}</h2>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Pending</p>

            <h2 className="text-3xl font-bold mt-2 text-yellow-600">
              {bookings.filter((b) => b.status === "Pending").length}
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Approved</p>

            <h2 className="text-3xl font-bold mt-2 text-green-600">
              {bookings.filter((b) => b.status === "Approved").length}
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Rejected</p>

            <h2 className="text-3xl font-bold mt-2 text-red-600">
              {bookings.filter((b) => b.status === "Rejected").length}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4">Clinic</th>

                  <th className="text-left p-4">Address</th>

                  <th className="text-left p-4">Phone</th>

                  <th className="text-left p-4">Scanner</th>

                  <th className="text-left p-4">Scanner Location</th>

                  <th className="text-left p-4">Booking Date</th>

                  <th className="text-left p-4">Booking Time</th>

                  <th className="text-left p-4">Status</th>

                  <th className="text-left p-4">Created</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-t border-gray-200">
                    <td className="p-4">{booking.clinicName || "-"}</td>

                    <td className="p-4">{booking.clinicAddress || "-"}</td>

                    <td className="p-4">{booking.phone || "-"}</td>

                    <td className="p-4">{booking.scannerId || "-"}</td>

                    <td className="p-4">{booking.scannerLocation || "-"}</td>

                    <td className="p-4">{booking.bookingDate || "-"}</td>

                    <td className="p-4">{booking.bookingTime || "-"}</td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-2 rounded-lg text-sm font-medium
                        ${
                          booking.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.status || "Pending"}
                      </span>
                    </td>

                    <td className="p-4 text-sm text-gray-600">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminBookingsPage;
