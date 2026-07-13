import express from "express";

import {
  createBooking,
  getBookings,
  getBookingById,
  getAvailableSlots,
} from "../controllers/bookingController";

const router = express.Router();

router.post("/", createBooking);

router.get("/", getBookings);

router.get("/slots", getAvailableSlots);

router.get("/:id", getBookingById);

export default router;
