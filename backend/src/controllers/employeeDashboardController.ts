import { Request, Response } from "express";
import Order from "../models/Order";

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

        console.log("Employee Name:", employeeName);
        console.log("Department:", department);
        console.log("Field:", field);

        const debugOrders = await Order.find({
            "production.printing.assignedTo": { $exists: true }
        });

        console.log("Printing Orders:");

        debugOrders.forEach((o: any) => {
            console.log({
                orderId: o.orderId,
                assigned: o.production?.printing?.assignedTo,
            });
        });

        const query = {
            [field]: employeeName,
        };

        console.log("Mongo Query:", query);

        const orders = await Order.find(query).sort({
            createdAt: -1,
        });

        console.log("Matched Orders:", orders.length);

        return res.json({
            success: true,
            employee: user,
            totalOrders: orders.length,
            orders,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
