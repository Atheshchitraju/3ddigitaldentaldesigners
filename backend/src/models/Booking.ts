import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
    },

    clinicName: {
      type: String,
      required: true,
      trim: true,
    },

    clinicAddress: {
      type: String,
      required: true,
      trim: true,
    },

    doctorName: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    scannerId: String,

    scannerLocation: String,
    bookingId: {
      type: String,
      unique: true,
    },

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

// ==========================
// Performance Indexes
// ==========================

// Search bookings by city
bookingSchema.index({ city: 1 });

// Fetch bookings for a selected date
bookingSchema.index({ bookingDate: 1 });

// Sort bookings by date and time
bookingSchema.index({ bookingDate: 1, bookingTime: 1 });

// Search bookings assigned to a scanner
bookingSchema.index({ scannerId: 1 });

// Fast lookup while checking scanner availability
bookingSchema.index({
  scannerId: 1,
  bookingDate: 1,
  bookingTime: 1,
});

// Filter bookings by status
bookingSchema.index({ status: 1 });

// Search bookings for a clinic
bookingSchema.index({ clinicId: 1 });

// Recent bookings
bookingSchema.index({ createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);
