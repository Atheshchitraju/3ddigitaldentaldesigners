import { Response } from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking";
import User from "../models/User";
import { AuthenticatedRequest } from "../middleware/userAuthMiddleware";

const BOOKING_STATUSES = [
  "Pending",
  "Assigned",
  "On The Way",
  "Reached",
  "Completed",
  "Cancelled",
] as const;
type BookingStatus = (typeof BOOKING_STATUSES)[number];

const getUserId = (req: AuthenticatedRequest): string | null => {
  const userId = req.user?.userId;
  return userId && mongoose.isValidObjectId(userId) ? userId : null;
};

export const createBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user" });
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(401).json({ message: "Invalid authenticated user" });
    }

    const {
      clinicId,
      clinicName,
      clinicAddress,
      doctorName,
      city,
      phone,
      scannerId,
      scannerLocation,
      operatorName,
      operatorPhone,
      bookingDate,
      bookingTime,
      priority,
      isRegistered,
    } = req.body as Record<string, unknown>;

    if (
      typeof clinicName !== "string" ||
      !clinicName.trim() ||
      typeof clinicAddress !== "string" ||
      !clinicAddress.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof scannerId !== "string" ||
      !scannerId.trim() ||
      typeof bookingDate !== "string" ||
      !bookingDate.trim() ||
      typeof bookingTime !== "string" ||
      !bookingTime.trim()
    ) {
      return res.status(400).json({ message: "Invalid booking data" });
    }

    if (priority !== undefined && priority !== "Normal" && priority !== "Emergency") {
      return res.status(400).json({ message: "Invalid booking priority" });
    }

    let validatedClinicId: mongoose.Types.ObjectId | undefined;
    if (clinicId !== undefined) {
      if (typeof clinicId !== "string" || !mongoose.isValidObjectId(clinicId)) {
        return res.status(400).json({ message: "Invalid clinic ID" });
      }
      validatedClinicId = new mongoose.Types.ObjectId(clinicId);
    }

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
      userId,
      clinicId: validatedClinicId,
      clinicName: clinicName.trim(),
      clinicAddress: clinicAddress.trim(),
      doctorName: typeof doctorName === "string" ? doctorName.trim() : undefined,
      city: typeof city === "string" ? city.trim() : undefined,
      phone: phone.trim(),
      scannerId: scannerId.trim(),
      scannerLocation:
        typeof scannerLocation === "string" ? scannerLocation.trim() : undefined,
      operatorName:
        typeof operatorName === "string" ? operatorName.trim() : undefined,
      operatorPhone:
        typeof operatorPhone === "string" ? operatorPhone.trim() : undefined,
      bookingDate: bookingDate.trim(),
      bookingTime: bookingTime.trim(),
      priority: priority ?? "Normal",
      isRegistered: typeof isRegistered === "boolean" ? isRegistered : true,
      bookingId,
    });

    res.status(201).json(booking);
  } catch (error: unknown) {
    console.error(error);

    res.status(500).json({
      message: "Error creating booking",
    });
  }
};

export const getBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user" });
    }

    const filter: {
      userId: mongoose.Types.ObjectId;
      bookingDate?: string;
      status?: BookingStatus;
    } = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (req.query.date) {
      filter.bookingDate = String(req.query.date);
    }

    if (req.query.status) {
      const status = String(req.query.status);
      if (
        status !== "Pending" &&
        status !== "Assigned" &&
        status !== "On The Way" &&
        status !== "Reached" &&
        status !== "Completed" &&
        status !== "Cancelled"
      ) {
        return res.status(400).json({ message: "Invalid booking status" });
      }
      filter.status = status;
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
export const getBookingById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user" });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(userId),
    })
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

export const cancelBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user" });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "Cancelled") {
      return res.status(409).json({ message: "Booking is already cancelled" });
    }

    if (booking.status !== "Pending" && booking.status !== "Assigned") {
      return res.status(409).json({
        message: `Booking with status ${booking.status} cannot be cancelled`,
      });
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        userId: new mongoose.Types.ObjectId(userId),
        status: { $in: ["Pending", "Assigned"] },
      },
      { $set: { status: "Cancelled" } },
      { new: true, runValidators: true },
    )
      .select("-__v")
      .lean();

    if (!updatedBooking) {
      return res.status(409).json({ message: "Booking cancellation conflict" });
    }

    return res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error cancelling booking" });
  }
};
export const getAvailableSlots = async (req: AuthenticatedRequest, res: Response) => {
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
