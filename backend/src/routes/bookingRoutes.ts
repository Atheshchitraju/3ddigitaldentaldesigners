import express from "express";

import {
  createBooking,
  getBookings,
  getBookingById,
  getAvailableSlots,
  cancelBooking,
} from "../controllers/bookingController";
import { userAuthMiddleware } from "../middleware/userAuthMiddleware";

const router = express.Router();

router.post("/", userAuthMiddleware, createBooking);

router.get("/", userAuthMiddleware, getBookings);

router.get("/slots", getAvailableSlots);

router.get("/:id", userAuthMiddleware, getBookingById);

router.patch("/:id/cancel", userAuthMiddleware, cancelBooking);

export default router;
