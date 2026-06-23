import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    clinicName: String,
    clinicAddress: String,

    scannerId: String,
    scannerLocation: String,

    bookingDate: String,
    bookingTime: String,

    phone: String,

    status: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "Booking",
  bookingSchema,
);