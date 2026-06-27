import express from "express";
import {
  updateDevice,
  getDevices,
  getDeviceById,
} from "../controllers/deviceController";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Device route works" });
});

router.get("/by-id/:deviceId", getDeviceById);

router.get("/", getDevices);

router.post("/update", updateDevice);

export default router;