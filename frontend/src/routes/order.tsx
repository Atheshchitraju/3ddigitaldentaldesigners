import { createFileRoute, useNavigate } from "@tanstack/react-router";
import OrderModal from "../components/OrderModal";

export const Route = createFileRoute("/order")({
  component: OrderPage,
});

function OrderPage() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen pt-24">
      <OrderModal
        open={true}
        onClose={handleClose}
      />
    </div>
  );
}