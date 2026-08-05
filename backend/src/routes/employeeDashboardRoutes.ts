import express from "express";

import { authMiddleware } from "../middleware/authMiddleware";

import { getEmployeeDashboard } from "../controllers/employeeDashboardController";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getEmployeeDashboard
);

export default router;