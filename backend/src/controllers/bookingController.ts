import { Request, Response } from "express";
import Booking from "../models/Booking";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { scannerId, bookingDate, bookingTime } = req.body;

    const existing = await Booking.findOne({
      scannerId,
      bookingDate,
      bookingTime,
      status: {
        $nin: ["Cancelled", "Completed"],
      },
    }).lean();

    if (existing) {
      return res.status(400).json({
        message: "Scanner already booked for this slot.",
      });
    }

    const total = await Booking.countDocuments();

    const bookingId = "SCN-" + new Date().getFullYear() + "-" + String(total + 1).padStart(5, "0");

    const booking = await Booking.create({
      ...req.body,
      bookingId,
    });

    res.status(201).json(booking);
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const filter: any = {};

    if (req.query.date) {
      filter.bookingDate = req.query.date;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .select("-__v")
      .sort({ bookingTime: 1 })
      .lean();

    res.json(bookings);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error fetching bookings",
    });
  }
};
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .select("-__v")
      .lean();

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const date = String(req.query.date || "");

    console.log("Requested date:", date);

    const bookings = await Booking.find({
      bookingDate: date,
      status: {
        $nin: ["Cancelled", "Completed"],
      },
    })
      .select("bookingTime")
      .lean();

    console.log("Bookings found:", bookings.length);

    const totalScanners = 2;

    const slots = [];

    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time =
          `${hour.toString().padStart(2, "0")}:` + `${minute.toString().padStart(2, "0")}`;

        const slotBookings = bookings.filter((b: any) => b.bookingTime === time);

        let status = "Available";
        let queue = 0;

        if (slotBookings.length >= totalScanners) {
          status = "Booked";
        }

        if (slotBookings.length > totalScanners) {
          status = "Queue";
          queue = slotBookings.length - totalScanners;
        }

        slots.push({
          time,
          status,
          queue,
        });
      }
    }

    res.json(slots);
  } catch (err) {
    console.error("SLOTS API ERROR:", err);

    res.status(500).json({
      message: "Server Error",
      error: err,
    });
  }
};
