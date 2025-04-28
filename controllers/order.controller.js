import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ Fix here

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price isAvailable",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check if all products are available
    const unavailableItems = cart.items.filter(
      (item) => !item.product.isAvailable
    );
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        message: "Some items are no longer available",
        items: unavailableItems.map((item) => item.product.name),
      });
    }

    // Create order items from cart items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Create new order
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      paymentMethod: req.body.paymentMethod || "cash",
      note: req.body.note || "",
      pickupTime: req.body.pickupTime || new Date(Date.now() + 30 * 60000), // Default 30 mins from now
    });

    const savedOrder = await newOrder.save();

    // Clear the user's cart after order is created
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [], totalAmount: 0 } }
    );

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders for current user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific order by ID
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to view this order
    if (order.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel an order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to cancel this order
    if (order.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // Only allow cancellation if order status is pending
    if (order.status !== "pending") {
      return res.status(400).json({
        message:
          "Cannot cancel order that is already being prepared or completed",
      });
    }

    order.status = "cancelled";
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const orders = await Order.find().sort({ createdAt: -1 }).populate({
      path: "user",
      select: "name email",
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Validate status manually if needed
    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

// Update payment status (admin only)
export const updatePaymentStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { paymentStatus } = req.body;

    // Validate payment status
    const validPaymentStatuses = ["pending", "paid", "failed"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
