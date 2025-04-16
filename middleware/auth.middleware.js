import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "secretkey");

    // Set both id and _id to ensure compatibility
    req.user = {
      id: decoded.id, // Keep this for existing controller references
      _id: decoded.id, // This is technically more standard for MongoDB
      isAdmin: decoded.isAdmin,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};

export default authMiddleware;
