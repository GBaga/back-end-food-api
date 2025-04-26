import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Log decoded token for debugging

    req.user = {
      _id: decoded._id, // Only use _id consistently
      isAdmin: decoded.isAdmin,
    };

    next();
  } catch (error) {
    console.error("JWT verification error:", error); // Log error for debugging
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token is invalid" });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

export default authMiddleware;
