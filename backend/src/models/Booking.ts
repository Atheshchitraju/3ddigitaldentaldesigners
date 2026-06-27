import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
    },

    clinicName: String,

    clinicAddress: String,

    doctorName: String,

    city: String,

    phone: String,

    scannerId: String,

    scannerLocation: String,

    operatorName: {
      type: String,
      default: "",
    },

    operatorPhone: {
      type: String,
      default: "",
    },

    bookingDate: String,

    bookingTime: String,

    priority: {
      type: String,
      enum: ["Normal", "Emergency"],
      default: "Normal",
    },

    status: {
      type: String,
      enum: ["Pending", "Assigned", "On The Way", "Reached", "Completed", "Cancelled"],
      default: "Pending",
    },

    eta: {
      type: Number,
      default: 0,
    },

    distance: {
      type: Number,
      default: 0,
    },

    isRegistered: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Booking", bookingSchema);
