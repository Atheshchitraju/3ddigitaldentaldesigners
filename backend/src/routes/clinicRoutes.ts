import express from "express";
import { seedClinics } from "../controllers/seedClinicController";
import {
  createClinic,
  getClinics,
  getAllClinics,
  approveClinic,
  rejectClinic,
  updateClinicLocation,
} from "../controllers/clinicController";

const router = express.Router();

router.get("/", getClinics);

router.post("/", createClinic);
router.post("/seed", seedClinics);
router.get("/all", getAllClinics);

router.put("/approve/:id", approveClinic);
router.put("/location/:id", (req, res, next) => {
  console.log("LOCATION ROUTE HIT");
  next();
}, updateClinicLocation);

router.delete("/reject/:id", rejectClinic);

export default router;
