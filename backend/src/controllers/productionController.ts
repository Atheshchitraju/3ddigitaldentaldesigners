import { Request, Response } from "express";
import Order from "../models/Order";

/**
 * Ensures order.production exists before it's read or written.
 * Needed because orders created before the `production` field was added
 * to the schema won't have it populated on existing documents.
 */
function ensureProduction(order: any) {
  if (!order.production) {
    order.production = {
      currentStage: "Received",

      designer: {
        assignedTo: "",
        assignedAt: null,
        startedAt: null,
        completedAt: null,
      },

      printing: {
        assignedTo: "",
        startedAt: null,
        completedAt: null,
      },

      ceramist: {
        assignedTo: "",
        startedAt: null,
        completedAt: null,
      },

      qc: {
        approvedBy: "",
        approvedAt: null,
        remarks: "",
      },

      dispatch: {
        courier: "",
        trackingId: "",
        dispatchedAt: null,
      },

      activity: [],
    };
  }

  return order.production;
}

/**
 * Appends a timestamped entry to production.activity.
 */
function addActivity(
  production: any,
  stage: string,
  action: string,
  user: string,
  note: string
) {
  production.activity.push({
    stage,
    action,
    user,
    note,
    createdAt: new Date(),
  });
}

/**
 * Assign Designer
 */
export const assignDesigner = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const designer = req.body.designer?.trim();

    if (!designer) {
      return res.status(400).json({
        success: false,
        message: "Designer is required.",
      });
    }

    const order = await Order.findOne({
      orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const production = ensureProduction(order);

    if (production.designer.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Designer has already been assigned.",
      });
    }

    // Backward compatibility
    order.designer = designer;

    // Production data
    production.designer.assignedTo = designer;
    production.designer.assignedAt = new Date();
    production.currentStage = "Designing";

    addActivity(
      production,
      "Designing",
      "Designer Assigned",
      designer,
      `${designer} assigned to this case`
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Designer assigned successfully.",
      order,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const startDesigning = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const production = ensureProduction(order);

    if (!production.designer.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Assign a designer before starting.",
      });
    }

    if (production.designer.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Design has already started.",
      });
    }

    order.status = "Designing";

    production.currentStage = "Designing";

    production.designer.startedAt = new Date();

    addActivity(
      production,
      "Designing",
      "Started",
      production.designer.assignedTo,
      "Design work started"
    );

    await order.save();

    return res.status(200).json({
      success: true,

      message: "Design started successfully.",

      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

export const completeDesigning = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const production = ensureProduction(order);

    if (!production.designer.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Design has not been started yet.",
      });
    }

    if (production.designer.completedAt) {
      return res.status(400).json({
        success: false,
        message: "Design has already been completed.",
      });
    }

    production.designer.completedAt = new Date();

    production.currentStage = "Printing";

    order.status = "Printing";

    addActivity(
      production,
      "Designing",
      "Completed",
      production.designer.assignedTo,
      "Design completed"
    );

    await order.save();

    return res.status(200).json({
      success: true,
      

      message: "Design completed successfully.",

      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};