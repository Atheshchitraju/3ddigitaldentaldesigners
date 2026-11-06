
import express from "express";

import {
    employeeLogin,
    forgotPassword,
    resetPassword,
    getLoggedEmployee,
    getEmployeeDashboard,
} from "../controllers/employeeAuthController";

import {
    createEmployee,
    getEmployees,
    deleteEmployee,
    toggleEmployee,
} from "../controllers/employeeController";

import {
    authMiddleware,
    requireRole,
} from "../middleware/authMiddleware";

const router = express.Router();

// Authentication
router.post("/login", employeeLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Employee access
router.get(
    "/me",
    authMiddleware,
    requireRole("Employee"),
    getLoggedEmployee
);

router.get(
    "/dashboard",
    authMiddleware,
    requireRole("Employee"),
    getEmployeeDashboard
);

// Admin-only employee management
router.post(
    "/",
    authMiddleware,
    requireRole("Admin"),
    createEmployee
);

router.get(
    "/",
    authMiddleware,
    requireRole("Admin"),
    getEmployees
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole("Admin"),
    deleteEmployee
);

router.put(
    "/:id/toggle",
    authMiddleware,
    requireRole("Admin"),
    toggleEmployee
);

export default router;
