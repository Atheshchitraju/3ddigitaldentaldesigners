import express from "express";

import {
  updateDevice,
  getDevices,
} from "../controllers/deviceController";

const router = express.Router();

router.post("/update", updateDevice);

router.get("/", getDevices);

export default router;