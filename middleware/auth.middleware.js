import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set both id and _id to ensure compatibility
    req.user = {
      id: decoded.id, // Keep this for existing controller references
      _id: decoded.id, // This is technically more standard for MongoDB
      isAdmin: decoded.isAdmin,
    };

    next();
  } catch (error) {
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
