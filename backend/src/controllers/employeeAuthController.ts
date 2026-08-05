import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Employee from "../models/Employee";
import Order from "../models/Order";

export const employeeLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required",
            });
        }

        const employee = await Employee.findOne({
            email: email.toLowerCase(),
        });

        if (!employee) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (employee.status !== "Active") {
            return res.status(401).json({
                success: false,
                message: "Employee account is inactive",
            });
        }

        const isMatch = await bcrypt.compare(password, employee.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        Employee.updateOne(
            { _id: employee._id },
            { lastLogin: new Date(), lastSeen: new Date() }
        ).exec();

        const token = jwt.sign(
            {
                employeeId: employee.employeeId,
                role: employee.role,
                department: employee.department,
                name: employee.name,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            token,
            employee: {
                employeeId: employee.employeeId,
                name: employee.name,
                role: employee.role,
                department: employee.department,
            },
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
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
