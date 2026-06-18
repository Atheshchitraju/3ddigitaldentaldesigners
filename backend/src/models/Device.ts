import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },

  clinicName: {
    type: String,
    default: "",
  },

  latitude: Number,

  longitude: Number,

  city: String,

  battery: Number,

  status: {
    type: String,
    default: "Available",
  },

  lastSeen: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Device", deviceSchema);
