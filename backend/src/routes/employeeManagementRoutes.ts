import express from "express";

import {
  createEmployee,
  getEmployees,
  deleteEmployee,
  toggleEmployee,
} from "../controllers/employeeController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createEmployee);

router.get("/", getEmployees);

router.delete("/:id", deleteEmployee);

router.put("/:id/toggle", toggleEmployee);
console.log("employeeManagementRoutes imported");

export default router;