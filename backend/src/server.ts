import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./config/db";

import caseRoutes from "./routes/caseRoutes";
import orderRoutes from "./routes/orderRoutes";
import authRoutes from "./routes/authRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import deviceRoutes from "./routes/deviceRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import clinicRoutes from "./routes/clinicRoutes";
import productionRoutes from "./routes/productionRoutes";


const app = express();

connectDB();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.use("/api/cases", caseRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/device", deviceRoutes);

app.use("/api/bookings", bookingRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/production", productionRoutes);

app.get("/athesh-test", (req, res) => {
  res.json({
    message: "This is my LOCAL backend",
    time: new Date(),
  });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
