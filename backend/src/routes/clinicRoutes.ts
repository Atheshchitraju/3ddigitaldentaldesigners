import express from "express";
import { seedClinics } from "../controllers/seedClinicController";
import { createClinic, getClinics } from "../controllers/clinicController";

const router = express.Router();

router.get("/", getClinics);

router.post("/", createClinic);
router.post("/seed", seedClinics);

export default router;
