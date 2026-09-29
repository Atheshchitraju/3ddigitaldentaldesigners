import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const userAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as {
      userId?: string;
      email?: string;
      accountType?: string;
    };

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user token",
      });
    }

    (req as any).user = decoded;

    next();
  } catch (error) {
    console.error("USER JWT ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};