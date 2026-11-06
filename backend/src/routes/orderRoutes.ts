
import express from "express";

import {
    authMiddleware,
    requireRole,
} from "../middleware/authMiddleware";

import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
} from "../controllers/orderController";

const router = express.Router();

// Public order creation
router.post("/", createOrder);

// Admin-only order management
router.get(
    "/",
    authMiddleware,
    requireRole("admin"),
    getOrders
);

router.get(
    "/:id",
    authMiddleware,
    requireRole("admin"),
    getOrderById
);

router.put(
    "/:id",
    authMiddleware,
    requireRole("admin"),
    updateOrderStatus
);

export default router;
