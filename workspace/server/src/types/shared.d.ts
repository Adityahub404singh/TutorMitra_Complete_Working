import express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        // Agar user me aur bhi properties hain toh yahan add karo
      };
    }
  }
}
