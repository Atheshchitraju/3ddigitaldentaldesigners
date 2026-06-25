import express from "express";
import { seedClinics } from "../controllers/seedClinicController";
import {
  createClinic,
  getClinics,
  getAllClinics,
  approveClinic,
  rejectClinic,
} from "../controllers/clinicController";

const router = express.Router();

router.get("/", getClinics);

router.post("/", createClinic);
router.post("/seed", seedClinics);
router.get("/all", getAllClinics);

router.put("/approve/:id", approveClinic);

router.delete("/reject/:id", rejectClinic);

export default router;
