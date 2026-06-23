import { Request, Response } from "express";
import Booking from "../models/Booking";

export const createBooking = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log("BODY:", req.body);

    const booking = await Booking.create(req.body);

    console.log("BOOKING CREATED:", booking);

    res.status(201).json(booking);
  } catch (error: any) {
    console.error("BOOKING ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find().sort({
      createdAt: -1,
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching bookings",
    });
  }
};
