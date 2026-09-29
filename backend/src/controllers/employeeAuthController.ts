import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/sendEmail";
import Employee from "../models/Employee";
import Order from "../models/Order";

export const employeeLogin = async (
    req: Request,
    res: Response
) => {
    const loginStart = performance.now();

    try {
        const { email, password } = req.body;

        console.log("🔐 Employee login:", email);

        // 1. MongoDB lookup
        const dbStart = performance.now();

        const employee = await Employee.findOne({
            email: email.toLowerCase(),
        });

        console.log(
            `⏱️ Employee.findOne: ${Math.round(
                performance.now() - dbStart
            )} ms`
        );

        if (!employee) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (employee.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "Employee account is inactive",
            });
        }

        // 2. Password verification
        const bcryptStart = performance.now();

        const isMatch = await bcrypt.compare(
            password,
            employee.password
        );

        console.log(
            `⏱️ bcrypt.compare: ${Math.round(
                performance.now() - bcryptStart
            )} ms`
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // 3. Non-blocking activity update
        Employee.updateOne(
            { _id: employee._id },
            {
                $set: {
                    lastLogin: new Date(),
                    lastSeen: new Date(),
                },
            }
        ).catch((err) => {
            console.error(
                "⚠️ Failed to update employee activity:",
                err
            );
        });

        // 4. JWT
        const jwtStart = performance.now();

        const token = jwt.sign(
            {
                id: employee._id,
                employeeId: employee.employeeId,
                role: employee.role,
                department: employee.department,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "7d",
            }
        );

        console.log(
            `⏱️ JWT generation: ${Math.round(
                performance.now() - jwtStart
            )} ms`
        );

        console.log(
            `🚀 TOTAL LOGIN: ${Math.round(
                performance.now() - loginStart
            )} ms`
        );

        return res.json({
            success: true,
            token,
            employee: {
                id: employee._id,
                employeeId: employee.employeeId,
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                role: employee.role,
                department: employee.department,
                status: employee.status,
            },
        });

    } catch (error: any) {
        console.error("Employee login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const getLoggedEmployee = async (req: Request, res: Response) => {
    try {
        const employee = await Employee.findOne({
            employeeId: (req as any).user.employeeId,
        }).select("-password");

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        Employee.updateOne(
            { _id: employee._id },
            { lastSeen: new Date() }
        ).exec();

        const orders = await Order.find({
            "production.designer.assignedTo": employee.name,
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            employee,
            orders,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const getEmployeeDashboard = async (
    req: Request,
    res: Response
) => {
    try {
        const user = (req as any).user;

        const employeeName = user.name;
        const department = user.department;

        let field = "";

        switch (department) {
            case "Designer":
                field = "production.designer.assignedTo";
                break;

            case "Printer":
                field = "production.printing.assignedTo";
                break;

            case "Metalist":
                field = "production.metalist.assignedTo";
                break;

            case "Ceramist":
                field = "production.ceramist.assignedTo";
                break;

            case "QC":
                field = "production.qc.assignedTo";
                break;

            case "Dispatch":
                field = "production.dispatch.assignedTo";
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid department",
                });
        }

        const orders = await Order.find({
            [field]: employeeName,
        }).sort({
            createdAt: -1,
        });

        const newOrders = orders.filter((o: any) => {
            switch (department) {
                case "Designer":
                    return !o.production.designer.startedAt;

                case "Printer":
                    return !o.production.printing.startedAt;

                case "Metalist":
                    return !o.production.metalist.startedAt;

                case "Ceramist":
                    return !o.production.ceramist.startedAt;

                case "QC":
                    return !o.production.qc.startedAt;

                case "Dispatch":
                    return !o.production.dispatch.startedAt;

                default:
                    return false;
            }
        });

        const pendingOrders = orders.filter((o: any) => {
            switch (department) {
                case "Designer":
                    return o.production.designer.startedAt && !o.production.designer.completedAt;

                case "Printer":
                    return o.production.printing.startedAt && !o.production.printing.completedAt;

                case "Metalist":
                    return o.production.metalist.startedAt && !o.production.metalist.completedAt;

                case "Ceramist":
                    return o.production.ceramist.startedAt && !o.production.ceramist.completedAt;

                case "QC":
                    return o.production.qc.startedAt && !o.production.qc.completedAt;

                case "Dispatch":
                    return o.production.dispatch.startedAt && !o.production.dispatch.completedAt;

                default:
                    return false;
            }
        });

        const completedOrders = orders.filter((o: any) => {
            switch (department) {
                case "Designer":
                    return o.production.designer.completedAt;

                case "Printer":
                    return o.production.printing.completedAt;

                case "Metalist":
                    return o.production.metalist.completedAt;

                case "Ceramist":
                    return o.production.ceramist.completedAt;

                case "QC":
                    return o.production.qc.completedAt;

                case "Dispatch":
                    return o.production.dispatch.completedAt;

                default:
                    return false;
            }
        });

        return res.json({
            success: true,
            employee: user,
            statistics: {
                total: orders.length,
                new: newOrders.length,
                pending: pendingOrders.length,
                completed: completedOrders.length,
            },
            orders,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// ─────────────────────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────────────────────

export const forgotPassword = async (
    req: Request,
    res: Response
) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const employee = await Employee.findOne({
            email: email.toLowerCase(),
        });

        // Don't reveal whether an account exists
        if (!employee) {
            return res.status(200).json({
                success: true,
                message:
                    "If an account exists with this email, a password reset link will be sent.",
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        employee.resetPasswordToken = resetToken;

        employee.resetPasswordExpires = new Date(
            Date.now() + 60 * 60 * 1000
        );

        await employee.save();

        await sendPasswordResetEmail(
            employee.email,
            employee.name,
            resetToken
        );

        console.log("Password reset email sent to:", employee.email);

        return res.status(200).json({
            success: true,
            message:
                "If an account exists with this email, a password reset link will be sent.",
        });

    } catch (error: any) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to process password reset request",
        });
    }
};
export const resetPassword = async (
    req: Request,
    res: Response
) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Token and password are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const employee = await Employee.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
                $gt: new Date(),
            },
        });

        if (!employee) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset link",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        employee.password = hashedPassword;

        employee.resetPasswordToken = undefined;
        employee.resetPasswordExpires = undefined;

        await employee.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error: any) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to reset password",
        });
    }
}