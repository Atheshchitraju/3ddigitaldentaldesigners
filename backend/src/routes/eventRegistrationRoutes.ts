
import { Router } from "express";
import { registerForDentistBrand } from "../controllers/eventRegistrationController";

const router = Router();

router.post("/register", registerForDentistBrand);

export default router;
