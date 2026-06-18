import { createFileRoute } from "@tanstack/react-router";
import ScannerTracking from "@/pages/ScannerTracking";

export const Route = createFileRoute("/admin/scanners")({
  component: ScannerTracking,
});
