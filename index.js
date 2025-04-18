import express from "express";
import mongoose from "mongoose";
import productRoute from "./routes/product.route.js";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import orderRoute from "./routes/order.route.js";
import cartRoute from "./routes/cart.route.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use("/api/products", productRoute);
app.use("/api/auth", authRoute);
app.use("/api/orders", orderRoute);
app.use("/api/cart", cartRoute);

app.get("/", (req, res) => {
  res.send("Hello World from Food Api Backend");
});

const conString =
  "mongodb+srv://Admin1:Admin1@backenddb.r5sppeu.mongodb.net/FIRSTAPI?retryWrites=true&w=majority&appName=BackendDB";
mongoose
  .connect(conString)
  .then(() => console.log("Connected!"))
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
