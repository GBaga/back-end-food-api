import express from "express";
const router = express.Router();
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

// All cart routes need authentication
router.use(authMiddleware);

// Get user's cart
router.get("/", getCart);

// Add item to cart
router.post("/", addItemToCart);

// Update cart item quantity
router.put("/", updateCartItem);

// Remove item from cart
router.delete("/item/:productId", removeCartItem);

// Clear cart
router.delete("/", clearCart);

export default router;
