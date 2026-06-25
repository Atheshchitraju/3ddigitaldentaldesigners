import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import API_URL from "../../config/api";

export const Route = createFileRoute("/admin/clinics")({
  component: AdminClinicsPage,
});

function AdminClinicsPage() {
  const navigate = useNavigate();

  const [clinics, setClinics] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate({
        to: "/admin/login",
      });

      return;
    }

    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clinics/`);

      const data = await response.json();

      setClinics(data);
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
  const approveClinic = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/clinics/approve/${id}`, {
        method: "PUT",
      });

      fetchClinics();
    } catch (error) {
      console.log(error);
    }
  };

  const rejectClinic = async (id: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to reject this clinic?");

      if (!confirmed) return;

      await fetch(`${API_URL}/api/clinics/reject/${id}`, {
        method: "DELETE",
      });

      fetchClinics();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-7xl mx-auto">
        <br />
        <br />
        <br />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#111827]">Clinic Management</h1>

            <p className="text-gray-500 mt-2">Registered clinics in system</p>
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Total Clinics</p>

            <h2 className="text-3xl font-bold mt-2">{clinics.length}</h2>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Approved</p>

            <h2 className="text-3xl font-bold mt-2 text-green-600">
              {clinics.filter((c) => c.isApproved).length}
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Pending</p>

            <h2 className="text-3xl font-bold mt-2 text-yellow-600">
              {clinics.filter((c) => !c.isApproved).length}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4">Clinic</th>
                  <th className="text-left p-4">Doctor</th>
                  <th className="text-left p-4">Phone</th>
                  <th className="text-left p-4">Address</th>
                  <th className="text-left p-4">Latitude</th>
                  <th className="text-left p-4">Longitude</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {clinics.map((clinic) => (
                  <tr key={clinic._id} className="border-t border-gray-200">
                    <td className="p-4">{clinic.name}</td>

                    <td className="p-4">{clinic.doctorName || "-"}</td>

                    <td className="p-4">{clinic.phone}</td>

                    <td className="p-4">{clinic.address}</td>

                    <td className="p-4">{clinic.latitude}</td>

                    <td className="p-4">{clinic.longitude}</td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          clinic.isApproved
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {clinic.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>

                    <td className="p-4 text-sm text-gray-600">
                      {new Date(clinic.createdAt).toLocaleString()}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        {!clinic.isApproved && (
                          <button
                            onClick={() => approveClinic(clinic._id)}
                            className="bg-green-600 text-white px-3 py-2 rounded-lg"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => rejectClinic(clinic._id)}
                          className="bg-red-600 text-white px-3 py-2 rounded-lg"
                        >
                          Reject
                        </button>
                      </div>
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

export default AdminClinicsPage;
