import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Custom request interface to add user property
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Middleware function to verify JWT token and attach user info to request
export const protect = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
