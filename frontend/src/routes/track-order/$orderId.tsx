import { useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import API_URL from "@/config/api";

export const Route = createFileRoute("/track-order/$orderId")({
  component: OrderTrackingPage,
});

function OrderTrackingPage() {
  const { orderId } = useParams({
    from: "/track-order/$orderId",
  });

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/orders/${encodeURIComponent(orderId)}`);

        const data = await response.json();

        if (!response.ok || !data.success || !data.order) {
          throw new Error(data.message || "Order not found");
        }

        setOrder(data.order);
      } catch (err) {
        console.error("Order tracking error:", err);

        setError(err instanceof Error ? err.message : "Unable to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Order Not Found</h1>

          <p className="mt-2 text-gray-600">{error || "Unable to find this order."}</p>

          <p className="mt-4 font-semibold">Order ID: {orderId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Order Tracking</h1>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <p>
            <strong>Order ID:</strong> {order.orderId}
          </p>

          <p className="mt-2">
            <strong>Patient:</strong> {order.patientName}
          </p>

          <p className="mt-2">
            <strong>Product:</strong> {order.product}
          </p>

          <p className="mt-2">
            <strong>Shade:</strong> {order.shade || "N/A"}
          </p>

          <p className="mt-2">
            <strong>Clinic:</strong> {order.clinic}
          </p>

          <p className="mt-2">
            <strong>Current Stage:</strong> {order.production?.currentStage || "Received"}
          </p>
        </div>
      </div>
    </div>
  );
}
