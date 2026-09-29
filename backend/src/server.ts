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
import employeeRoutes from "./routes/employeeRoutes";
import employeeManagementRoutes from "./routes/employeeManagementRoutes";
import employeeDashboardRoutes from "./routes/employeeDashboardRoutes";
import partnerApplicationRoutes from "./routes/partnerApplicationRoutes";
import chatRoutes from "./routes/chatRoutes";
import userAuthRoutes from "./routes/userAuthRoutes";
const app = express();

connectDB();

app.use(cors());

app.use(express.json());
app.get("/api/partner-test", (req, res) => {
  console.log("PARTNER TEST DIRECT ROUTE HIT");

  res.json({
    success: true,
    message: "Partner route system is working",
  });
});

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.use("/api/cases", caseRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/user-auth", userAuthRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/device", deviceRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/clinics", clinicRoutes);

app.use("/api/partner-applications", partnerApplicationRoutes);
console.log("Partner Application Routes Loaded");

app.use("/api/chat", chatRoutes);

app.use("/api/production", productionRoutes);
app.use("/api/employee", employeeRoutes);
console.log("Employee Routes Loaded");
app.use("/api/employees",employeeManagementRoutes);
app.use("/api/employee/dashboard",employeeDashboardRoutes);

app.get("/athesh-test", (req, res) => {
  res.json({
    message: "This is my LOCAL backend",
    time: new Date(),
  });
});
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
