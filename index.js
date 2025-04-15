import express from "express";
import mongoose from "mongoose";
import productRoute from "./routes/product.route.js";
import cors from "cors";

const app = express();

app.use(cors());

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use("/api/products", productRoute);

app.get("/", (req, res) => {
  res.send("Hello World x");
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
