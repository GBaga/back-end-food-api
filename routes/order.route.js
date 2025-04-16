import express from "express";
const router = express.Router();
import {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
  cancelOrder,
} from "../controllers/order.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

// User routes
router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getUserOrders);
router.get("/:id", authMiddleware, getOrder);
router.patch("/:id/cancel", authMiddleware, cancelOrder);

// Admin routes - modify how you handle admin authorization
router.get("/admin/all", authMiddleware, getAllOrders);
router.patch("/admin/:id/status", authMiddleware, updateOrderStatus);
router.patch("/admin/:id/payment", authMiddleware, updatePaymentStatus);

export default router;
