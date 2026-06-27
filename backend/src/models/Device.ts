import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },

    clinicName: {
      type: String,
      default: "",
    },

    operatorName: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    latitude: {
      type: Number,
      default: 0,
    },

    longitude: {
      type: Number,
      default: 0,
    },

    city: {
      type: String,
      default: "",
    },

    battery: {
      type: Number,
      default: 100,
    },

    speed: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Available", "Assigned", "On The Way", "Reached", "Offline"],
      default: "Available",
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Device", deviceSchema);
