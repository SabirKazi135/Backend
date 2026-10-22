import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured",
      });
    }

    if (!token) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string" || typeof decoded.userId !== "string") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
