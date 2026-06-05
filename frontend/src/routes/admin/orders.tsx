import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import API_URL from "../../config/api";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [clinicFilter, setClinicFilter] = useState("All");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate({
        to: "/admin/login",
      });

      return;
    }

    fetchOrders();
  }, []);

  // FETCH ORDERS

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("adminToken");

        navigate({
          to: "/admin/login",
        });

        return;
      }

      const data = await response.json();

      console.log(data);

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // UPDATE ORDER

  const updateOrder = async (id: string, updates: any) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}/api/orders/${id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(updates),
      });

      if (response.status === 401) {
        localStorage.removeItem("adminToken");

        navigate({
          to: "/admin/login",
        });

        return;
      }

      const data = await response.json();

      console.log(data);

      if (data.success) {
        fetchOrders();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // LOGOUT

  const handleLogout = () => {
    localStorage.removeItem("adminToken");

    navigate({
      to: "/admin/login",
    });
  };

  // EXPORT EXCEL

  const exportToExcel = () => {
    const exportData = filteredOrders.map((order: any) => ({
      OrderID: order.orderId,

      DoctorName: order.name,

      Phone: order.phone,

      Clinic: order.clinic,

      ClinicEmail: order.clinicEmail,

      WhatsApp: order.clinicWhatsapp,

      Product: order.product,

      Shade: order.shade,

      SelectedTeeth: Array.isArray(order.selectedTeeth) ? order.selectedTeeth.join(", ") : "",

      Notes: order.notes,

      Status: order.status,

      Designer: order.designer,

      PaymentStatus: order.paymentStatus,
      Amount: order.amount,
      PaymentID: order.paymentDetails?.razorpayPaymentId,
      PaymentMode: order.paymentDetails?.paymentMethod,

      OrderedDate: new Date(order.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, `Orders_${Date.now()}.xlsx`);
  };

  // FILTERS

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      order.product?.toLowerCase().includes(search.toLowerCase()) ||
      order.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" ? true : order.status === statusFilter;

    const matchesClinic = clinicFilter === "All" ? true : order.clinic === clinicFilter;

    return matchesSearch && matchesStatus && matchesClinic;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-7xl mx-auto">
        <br />
        <br />
        <br />

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#111827]">Order Management</h1>

            <p className="text-gray-500 mt-2">Manage all clinic orders and workflow</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-5 py-3 rounded-xl font-medium"
            >
              Export Excel
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-5 py-3 rounded-xl font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Total Orders</p>

            <h2 className="text-3xl font-bold mt-2">{orders.length}</h2>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Placed</p>

            <h2 className="text-3xl font-bold mt-2 text-gray-700">
              {orders.filter((o: any) => o.status === "Placed").length}
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Designing</p>

            <h2 className="text-3xl font-bold mt-2 text-yellow-600">
              {orders.filter((o: any) => o.status === "Designing").length}
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Completed</p>

            <h2 className="text-3xl font-bold mt-2 text-green-600">
              {orders.filter((o: any) => o.status === "Completed").length}
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm text-gray-500">Delivered</p>

            <h2 className="text-3xl font-bold mt-2 text-purple-600">
              {orders.filter((o: any) => o.status === "Delivered").length}
            </h2>
          </div>
        </div>

        {/* FILTERS */}

        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SEARCH */}

            <input
              type="text"
              placeholder="Search order ID, doctor or product"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 border border-gray-300 rounded-xl px-4 outline-none"
            />

            {/* STATUS FILTER */}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 border border-gray-300 rounded-xl px-4 outline-none"
            >
              <option value="All">All Status</option>

              <option value="Placed">Placed</option>

              <option value="Accepted">Accepted</option>

              <option value="Designing">Designing</option>

              <option value="Printing">Printing</option>

              <option value="Completed">Completed</option>

              <option value="Delivered">Delivered</option>

              <option value="Rejected">Rejected</option>
            </select>

            {/* CLINIC FILTER */}

            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              className="h-12 border border-gray-300 rounded-xl px-4 outline-none"
            >
              <option value="All">All Clinics</option>

              {[...new Set(orders.map((o: any) => o.clinic))].map((clinic: any) => (
                <option key={clinic} value={clinic}>
                  {clinic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE */}

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1800px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-semibold">Order ID</th>

                  <th className="text-left p-4 font-semibold">Doctor Name</th>

                  <th className="text-left p-4 font-semibold">Phone</th>

                  <th className="text-left p-4 font-semibold">Clinic</th>

                  <th className="text-left p-4 font-semibold">Email</th>

                  <th className="text-left p-4 font-semibold">WhatsApp</th>

                  <th className="text-left p-4 font-semibold">Product</th>

                  <th className="text-left p-4 font-semibold">Shade</th>

                  <th className="text-left p-4 font-semibold">Teeth</th>

                  <th className="text-left p-4 font-semibold">Notes</th>

                  <th className="text-left p-4 font-semibold">Status</th>

                  <th className="text-left p-4 font-semibold">Designer</th>

                  <th className="text-left p-4 font-semibold">Ordered Date</th>

                  <th className="text-left p-4 font-semibold">Delivered At</th>
                  <th className="text-left p-4 font-semibold">Payment Status</th>

                  <th className="text-left p-4 font-semibold">Amount</th>

                  <th className="text-left p-4 font-semibold">Payment ID</th>

                  <th className="text-left p-4 font-semibold">Payment Mode</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">{order.orderId}</td>

                    <td className="p-4">{order.name || "-"}</td>

                    <td className="p-4">{order.phone || "-"}</td>

                    <td className="p-4">{order.clinic || "-"}</td>

                    <td className="p-4 text-sm">{order.clinicEmail || "-"}</td>

                    <td className="p-4">{order.clinicWhatsapp || "-"}</td>

                    <td className="p-4">{order.product || "-"}</td>

                    <td className="p-4">{order.shade || "-"}</td>

                    <td className="p-4">
                      {Array.isArray(order.selectedTeeth) ? order.selectedTeeth.join(", ") : "-"}
                    </td>

                    <td className="p-4 max-w-[300px]">{order.notes || "-"}</td>

                    {/* STATUS */}

                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrder(order.orderId, {
                            status: e.target.value,
                          })
                        }
                        className={`px-3 py-2 rounded-xl text-sm font-medium border outline-none

                        ${
                          order.status === "Placed"
                            ? "bg-gray-100 text-gray-700 border-gray-300"
                            : order.status === "Accepted"
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : order.status === "Designing"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                : order.status === "Printing"
                                  ? "bg-orange-100 text-orange-700 border-orange-300"
                                  : order.status === "Completed"
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : order.status === "Delivered"
                                      ? "bg-purple-100 text-purple-700 border-purple-300"
                                      : "bg-red-100 text-red-700 border-red-300"
                        }
                        `}
                      >
                        <option value="Placed">Placed</option>

                        <option value="Accepted">Accepted</option>

                        <option value="Designing">Designing</option>

                        <option value="Printing">Printing</option>

                        <option value="Completed">Completed</option>

                        <option value="Delivered">Delivered</option>

                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* DESIGNER */}

                    <td className="p-4">
                      <input
                        type="text"
                        defaultValue={order.designer}
                        placeholder="Assign designer"
                        onBlur={(e) =>
                          updateOrder(order.orderId, {
                            designer: e.target.value,
                          })
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-[140px] outline-none"
                      />
                    </td>

                    {/* DATE */}

                    <td className="p-4 text-sm text-gray-600">
                      <div>{new Date(order.createdAt).toLocaleDateString()}</div>

                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.deliveredAt ? (
                        <>
                          <div>{new Date(order.deliveredAt).toLocaleDateString()}</div>

                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(order.deliveredAt).toLocaleTimeString()}
                          </div>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.paymentStatus || "-"}
                      </span>
                    </td>

                    <td className="p-4 font-medium">₹{order.amount || 0}</td>

                    <td className="p-4 text-xs break-all">
                      {order.paymentDetails?.razorpayPaymentId || "-"}
                    </td>

                    <td className="p-4">
                      {order.paymentDetails?.paymentMethod || order.paymentMode || "-"}
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
