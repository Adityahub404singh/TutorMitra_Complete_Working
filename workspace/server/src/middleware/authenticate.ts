import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const authenticate = (req, res, next) => {
  try {
    // Authorization header me token aisa aata hai: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing from header" });
    }

    // Token verify karo
    const decoded = jwt.verify(token, JWT_SECRET);

    // Decoded user info ko req object me daalo
    req.user = decoded;

    // Next middleware/route handler ko call karo
    next();
  } catch (error) {
    // Agar token invalid ho ya expire ho to error bhejo
    return res.status(403).json({ message: "Token invalid or expired" });
  }
};
