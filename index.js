import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import productRoute from "./routes/product.route.js";
import authRoute from "./routes/auth.route.js";
import orderRoute from "./routes/order.route.js";
import cartRoute from "./routes/cart.route.js";

dotenv.config();
const app = express();

// ✅ Read allowed origins from .env
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // only needed if using cookies or auth later
  })
);

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Routes
app.use("/api/products", productRoute);
app.use("/api/auth", authRoute);
app.use("/api/orders", orderRoute);
app.use("/api/cart", cartRoute);

app.get("/", (req, res) => {
  res.send("Hello World from Food API Backend");
});

// ✅ MongoDB Connection
const conString = process.env.MONGODB_URI || "your-default-mongodb-string";
mongoose
  .connect(conString)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });

// ✅ Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Debug
console.log("ALLOWED_ORIGINS:", allowedOrigins);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
