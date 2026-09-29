import express from "express";
import { chatWithAI } from "../controllers/chatController";

const router = express.Router();

router.post("/", chatWithAI);

export default router;