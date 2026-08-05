import express from "express";

import {
    employeeLogin,
    getLoggedEmployee,
    getEmployeeDashboard,
} from "../controllers/employeeAuthController";

import {
    createEmployee,
    getEmployees,
    deleteEmployee,
    toggleEmployee,
} from "../controllers/employeeController";



import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

/* Authentication */

router.post("/login", employeeLogin);

router.get("/me", authMiddleware, getLoggedEmployee);
router.get(
    "/dashboard",
    authMiddleware,
    getEmployeeDashboard
);

/* Employee Management */

router.post("/", authMiddleware, createEmployee);

router.get("/", authMiddleware, getEmployees);

router.delete("/:id", authMiddleware, deleteEmployee);

router.put("/:id/toggle", authMiddleware, toggleEmployee);


export default router;