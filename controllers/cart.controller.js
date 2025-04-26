import Cart from "../models/cart.model.js"; // Assuming correct path
import Product from "../models/product.model.js"; // In case you want to validate product existence

export const addItemToCart = async (req, res) => {
  const userId = req.user.id; // ✅ From authMiddleware
  const { productId, quantity } = req.body;

  console.log("🛒 Add item - userId:", userId, "productId:", productId);

  try {
    // OPTIONAL: Validate that product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // ❗ No cart exists for this user — create new
      console.log("No cart found, creating new one...");
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // If item exists, just update quantity
      existingItem.quantity += quantity;
    } else {
      // Else, add new item
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    console.log("✅ Cart updated:", cart);

    return res.status(200).json(cart);
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
