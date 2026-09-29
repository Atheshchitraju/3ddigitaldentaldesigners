import express from "express";

import {
  createPartnerApplication,
  getPendingPartnerApplications,
  getPartnerApplication,
  approvePartnerApplication,
  rejectPartnerApplication,
  getApprovedPartnerClinics,
} from "../controllers/partnerApplicationController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// TEST ROUTE
router.get("/test", (req, res) => {
  console.log("PARTNER TEST ROUTE HIT");
  res.json({
    success: true,
    message: "Partner application routes are working",
  });
});

// PUBLIC - Partner With Us
router.post(
  "/",
  (req, res, next) => {
    console.log("=================================");
    console.log("PARTNER APPLICATION POST HIT");
    console.log("BODY:", req.body);
    console.log("=================================");
    next();
  },
  createPartnerApplication
);

// PUBLIC - Approved clinics for website
router.get(
  "/public",
  getApprovedPartnerClinics
);

// ADMIN

router.get(
  "/pending",
  authMiddleware,
  getPendingPartnerApplications
);

router.get(
  "/:id",
  authMiddleware,
  getPartnerApplication
);

router.put(
  "/approve/:id",
  authMiddleware,
  approvePartnerApplication
);

router.put(
  "/reject/:id",
  authMiddleware,
  rejectPartnerApplication
);

export default router;