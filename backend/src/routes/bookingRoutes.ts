import express from "express";

import {
  createBooking,
  getBookings,
  getBookingById,
} from "../controllers/bookingController";

const router = express.Router();

router.post("/", createBooking);

router.get("/", getBookings);

//  NEW ROUTE
router.get("/:id", getBookingById);

export default router;