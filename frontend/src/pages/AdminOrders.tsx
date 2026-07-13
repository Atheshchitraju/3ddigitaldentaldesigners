import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import API_URL from "@/config/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const navigate = useNavigate();

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

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // UPDATE STATUS

  const updateStatus = async (orderId: string, status: string) => {
    try {
      console.log("================================");
      console.log("STATUS BUTTON CLICKED");
      console.log("ORDER ID:", orderId);
      console.log("NEW STATUS:", status);
      console.log("================================");

      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      console.log("STATUS RESPONSE:", data);

      if (data.success) {
        alert("Status Updated Successfully");

        fetchOrders();
      } else {
        alert("Failed To Update Status");
      }
    } catch (error) {
      console.log("STATUS UPDATE ERROR:");
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>

        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[2200px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Order ID</th>

              <th className="p-3 text-left">Doctor</th>

              <th className="p-3 text-left">Patient Name</th>

              <th className="p-3 text-left">Age</th>

              <th className="p-3 text-left">Phone</th>

              <th className="p-3 text-left">Clinic</th>

              <th className="p-3 text-left">Clinic Email</th>

              <th className="p-3 text-left">WhatsApp</th>

              <th className="p-3 text-left">Product</th>

              <th className="p-3 text-left">Shade</th>

              <th className="p-3 text-left">Selected Teeth</th>

              <th className="p-3 text-left">Notes</th>

              <th className="p-3 text-left">Status</th>

              <th className="p-3 text-left">Update Status</th>

              <th className="p-3 text-left">Designer</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order: any) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{order.orderId}</td>

                <td className="p-3 font-medium">{order.name || "-"}</td>

                <td className="p-3 font-semibold text-blue-700">{order.patientName || "-"}</td>

                <td className="p-3">{order.patientAge || "-"}</td>

                <td className="p-3">{order.phone || "-"}</td>

                <td className="p-3">{order.clinic || "-"}</td>

                <td className="p-3">{order.clinicEmail || "-"}</td>

                <td className="p-3">{order.clinicWhatsapp || "-"}</td>

                <td className="p-3">{order.product || "-"}</td>

                <td className="p-3">{order.shade || "-"}</td>

                <td className="p-3">
                  {Array.isArray(order.selectedTeeth) ? order.selectedTeeth.join(", ") : "-"}
                </td>

                <td className="p-3 max-w-[300px] whitespace-pre-wrap">{order.notes || "-"}</td>

                <td className="p-3 font-semibold">{order.status || "Pending"}</td>

                <td className="p-3">
                  <select
                    value={order.status || "Pending"}
                    onChange={(e) => updateStatus(order.orderId, e.target.value)}
                    className="border p-2 rounded"
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

                <td className="p-3">{order.designer || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
