import express from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} from "../controllers/userAuthController";

import { userAuthMiddleware } from "../middleware/userAuthMiddleware";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.get("/me", userAuthMiddleware, getCurrentUser);

export default router;