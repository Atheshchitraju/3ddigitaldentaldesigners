
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthPayload {
    id: string;
    employeeId: string;
    role: string;
    department?: string;
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No valid token provided",
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        ) as AuthPayload;

        if (!decoded.id || !decoded.role) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload",
            });
        }

        (req as any).user = {
            ...decoded,
            role: decoded.role.toLowerCase(),
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export const requireRole = (...roles: string[]) => {
    const allowedRoles = roles.map(role => role.toLowerCase());

    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission",
            });
        }

        next();
    };
};
