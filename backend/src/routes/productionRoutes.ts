import express from "express";

import {
  assignDesigner,
  startDesigning,
  completeDesigning,
} from "../controllers/productionController";

const router = express.Router();

router.put(
  "/:orderId/designer",
  assignDesigner
);

router.put(
  "/:orderId/design/start",
  startDesigning
);

router.put(
  "/:orderId/design/complete",
  completeDesigning
);

export default router;