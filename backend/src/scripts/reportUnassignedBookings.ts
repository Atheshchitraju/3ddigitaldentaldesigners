import mongoose from "mongoose";
import Booking from "../models/Booking";

const reportUnassignedBookings = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(mongoUri);

  const count = await Booking.countDocuments({
    $or: [
      { userId: { $exists: false } },
      { userId: null },
    ],
  });

  console.log(JSON.stringify({ unassignedLegacyBookings: count }));
  await mongoose.disconnect();
};

reportUnassignedBookings()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Legacy report failed");
    process.exitCode = 1;
  });
