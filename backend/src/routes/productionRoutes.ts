import express from "express";

import {
  assignDesigner,
  startDesigning,
  completeDesigning,
  assignPrinter,
  startPrinting,
  completePrinting,
  assignMetalist,
  startMetalWork,
  completeMetalWork,
  assignCeramist,
  startCeramist,
  completeCeramist,
  assignQC,
   StartQC,
  completeQC,
  assignDispatch,
  startDispatch,
  completeDispatch,
  markDelivered,
} from "../controllers/productionController";

const router = express.Router();

/* ==========================
   Designer
========================== */

router.put("/:orderId/designer", assignDesigner);
router.put("/:orderId/design/start", startDesigning);
router.put("/:orderId/design/complete", completeDesigning);

/* ==========================
   Printing
========================== */

router.put("/:orderId/printing", assignPrinter);
router.put("/:orderId/printing/start", startPrinting);
router.put("/:orderId/printing/complete", completePrinting);


/* ==========================
   Metalist
========================== */
router.put("/:orderId/metalist", assignMetalist);
router.put("/:orderId/metalist/start", startMetalWork);
router.put("/:orderId/metalist/complete", completeMetalWork);

/* ==========================
    Ceramist
========================== */
router.put("/:orderId/ceramist", assignCeramist);
router.put("/:orderId/ceramist/start", startCeramist);
router.put("/:orderId/ceramist/complete", completeCeramist);

/* ==========================
    QC
========================== */
router.put("/:orderId/qc", assignQC);
router.put("/:orderId/start", StartQC);
router.put("/:orderId/completed", completeQC);

/* ==========================
   Dispatch
========================== */
router.put("/:orderId/dispatch", assignDispatch);
router.put("/:orderId/dispatch/start", startDispatch);
router.put("/:orderId/dispatch/complete", completeDispatch);

/* ==========================
   Delivery
========================== */
router.put("/:orderId/delivered", markDelivered);

export default router;