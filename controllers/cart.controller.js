import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price imageUrl",
    });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalAmount: 0,
      });
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
export const addItemToCart = async (req, res) => {
  try {
    console.log("Received addToCart request body:", req.body);
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "ProductId and quantity are required" });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.isAvailable) {
      return res.status(400).json({ message: "Product is not available" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalAmount: 0,
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
      });
    }

    await cart.save(); // ✅ Save before populate

    await cart.populate({
      path: "items.product",
      select: "name price imageUrl",
    });

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity,
      0
    );

    await cart.save(); // ✅ Save updated totalAmount

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "ProductId and quantity are required" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;

    await cart.save();
    await cart.populate({
      path: "items.product",
      select: "name price imageUrl",
    });

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate({
      path: "items.product",
      select: "name price imageUrl",
    });

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalAmount = 0;

    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully", cart });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: error.message });
  }
};
