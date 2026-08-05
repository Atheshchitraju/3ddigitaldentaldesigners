import { Request, Response } from "express";
import bcrypt from "bcrypt";

import Employee from "../models/Employee";

/**
 * Create Employee
 */
export const createEmployee = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            role,
            department,
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const existing = await Employee.findOne({
            email: email.toLowerCase(),
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Employee already exists",
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const employeeCount =
            await Employee.countDocuments();

        const employee = await Employee.create({
            employeeId:
                "EMP" +
                String(employeeCount + 1).padStart(4, "0"),

            name,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            role,
            department,
        });
        console.log(employee);

        return res.status(201).json({
            success: true,
            message: "Employee created",

            employee,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Get All Employees
 */

export const getEmployees = async (
    req: Request,
    res: Response
) => {
    try {

        const { department } = req.query;

        const filter: any = {};

        if (department) {
            filter.department = department;
        }

        filter.status = "Active";

        const employees = await Employee.find(filter)
            .select("-password")
            .sort({
                name: 1,
            });

        return res.json({
            success: true,
            employees,
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

/**
 * Delete Employee
 */

export const deleteEmployee =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            await Employee.findByIdAndDelete(
                req.params.id
            );

            return res.json({
                success: true,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,

                message: error.message,
            });
        }
    };

/**
 * Activate / Deactivate
 */

export const toggleEmployee =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const employee =
                await Employee.findById(
                    req.params.id
                );

            if (!employee) {
                return res.status(404).json({
                    success: false,
                });
            }

            employee.status =
                employee.status === "Active"
                    ? "Inactive"
                    : "Active";

            await employee.save();

            return res.json({
                success: true,

                employee,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,

                message: error.message,
            });
        }
    };