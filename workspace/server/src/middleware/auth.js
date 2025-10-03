import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1]; // Authorization: Bearer <token>
    if (!token) {
      return res.status(401).json({ message: "Token missing from header" });
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error("JWT_SECRET not set in environment");
    }

    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // user info attach kar rahe request mein
    next();
  } catch (err) {
    console.error("Authentication middleware error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
