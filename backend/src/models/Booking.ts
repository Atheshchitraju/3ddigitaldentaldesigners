import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    clinicName: String,

    clinicAddress: String,

    doctorName: String,

    city: String,

    phone: String,

    scannerId: String,

    scannerLocation: String,

    bookingDate: String,

    bookingTime: String,

    isRegistered: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Booking", bookingSchema);
