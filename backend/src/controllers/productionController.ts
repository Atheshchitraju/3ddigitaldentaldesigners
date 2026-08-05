import { Request, Response } from "express";
import Order from "../models/Order";
import Employee from "../models/Employee";

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
        assignedAt: null,
        startedAt: null,
        completedAt: null,
      },

      metalist: {
        assignedTo: "",
        assignedAt: null,
        startedAt: null,
        completedAt: null,
      },

      ceramist: {
        assignedTo: "",
        assignedAt: null,
        startedAt: null,
        completedAt: null,
      },

      qc: {
        assignedTo: "",
        assignedAt: null,
        startedAt: null,
        completedAt: null,
      },

      dispatch: {
        assignedTo: "",
        assignedAt: null,
        startedAt: null,
        completedAt: null,
      },

      delivery: {
        deliveredAt: null,
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

async function employeeAssigned(employeeName: string) {
  if (!employeeName) return;

  await Employee.findOneAndUpdate(
    { name: employeeName },
    {
      $inc: {
        assignedOrders: 1,
      },
      $set: {
        workingStatus: "Busy",
      },
    }
  );
}

async function employeeCompleted(employeeName: string) {
  if (!employeeName) return;

  await Employee.findOneAndUpdate(
    { name: employeeName },
    {
      $inc: {
        completedOrders: 1,
      },
    }
  );
}

async function updateEmployeeWorkingStatus(
  employeeName: string,
  stageKey: string
) {
  if (!employeeName) return;

  const pendingOrders = await Order.countDocuments({
    [`production.${stageKey}.assignedTo`]: employeeName,
    $or: [
      {
        [`production.${stageKey}.completedAt`]: null,
      },
      {
        [`production.${stageKey}.completedAt`]: {
          $exists: false,
        },
      },
    ],
  });

  await Employee.findOneAndUpdate(
    { name: employeeName },
    {
      workingStatus:
        pendingOrders > 0 ? "Busy" : "Available",
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Designer
// ─────────────────────────────────────────────────────────────────────────

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

    await employeeAssigned(designer);

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

/**
 * Complete Designing
 */
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

    await employeeCompleted(
      production.designer.assignedTo
    );

    await updateEmployeeWorkingStatus(
      production.designer.assignedTo,
      "designer"
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

// ─────────────────────────────────────────────────────────────────────────
// Printing
// ─────────────────────────────────────────────────────────────────────────

/**
 * Assign Printer
 */
export const assignPrinter = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const printer = req.body.printer?.trim();

    if (!printer) {
      return res.status(400).json({
        success: false,
        message: "Printer is required.",
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

    if (production.printing.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Printer has already been assigned.",
      });
    }

    production.printing.assignedTo = printer;
    production.printing.assignedAt = new Date();

    production.currentStage = "Printing";

    addActivity(
      production,
      "Printing",
      "Printer Assigned",
      printer,
      `${printer} assigned to this case`
    );

    await employeeAssigned(printer);

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Printer assigned successfully.",
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

/**
 * Start Printing
 */
export const startPrinting = async (req: Request, res: Response) => {
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

    if (!production.printing.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Assign a printer before starting.",
      });
    }

    if (production.printing.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Printing has already started.",
      });
    }

    order.status = "Printing";

    production.currentStage = "Printing";

    production.printing.startedAt = new Date();

    addActivity(
      production,
      "Printing",
      "Started",
      production.printing.assignedTo,
      "Printing started"
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Printing started successfully.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Complete Printing
 */
export const completePrinting = async (req: Request, res: Response) => {
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

    if (!production.printing.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Printing has not been started yet.",
      });
    }

    if (production.printing.completedAt) {
      return res.status(400).json({
        success: false,
        message: "Printing has already been completed.",
      });
    }

    production.printing.completedAt = new Date();

    production.currentStage = "Metalist";

    order.status = "Metalist";

    addActivity(
      production,
      "Printing",
      "Completed",
      production.printing.assignedTo,
      "Printing completed"
    );

    await employeeCompleted(
      production.printing.assignedTo
    );

    await updateEmployeeWorkingStatus(
      production.printing.assignedTo,
      "printing"
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Printing completed successfully.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Metalist
// ─────────────────────────────────────────────────────────────────────────

/**
 * Assign Metalist
 */
export const assignMetalist = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const metalist = req.body.metalist?.trim();

    if (!metalist) {
      return res.status(400).json({
        success: false,
        message: "Metalist is required.",
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

    if (production.metalist.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Metalist has already been assigned.",
      });
    }

    production.metalist.assignedTo = metalist;
    production.metalist.assignedAt = new Date();

    production.currentStage = "Metalist";

    addActivity(
      production,
      "Metalist",
      "Metalist Assigned",
      metalist,
      `${metalist} assigned to this case`
    );

    await employeeAssigned(metalist);

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Metalist assigned successfully.",
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

/**
 * Start Metal Work
 */
export const startMetalWork = async (req: Request, res: Response) => {
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

    if (!production.metalist.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Assign a metalist before starting.",
      });
    }

    if (production.metalist.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Metal work has already started.",
      });
    }

    order.status = "Metalist";

    production.currentStage = "Metalist";

    production.metalist.startedAt = new Date();

    addActivity(
      production,
      "Metalist",
      "Started",
      production.metalist.assignedTo,
      "Metal work started"
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Metal work started successfully.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Complete Metal Work
 */
export const completeMetalWork = async (req: Request, res: Response) => {
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

    if (!production.metalist.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Metal work has not been started yet.",
      });
    }

    if (production.metalist.completedAt) {
      return res.status(400).json({
        success: false,
        message: "Metal work has already been completed.",
      });
    }

    production.metalist.completedAt = new Date();

    production.currentStage = "Ceramist";

    order.status = "Ceramist";

    addActivity(
      production,
      "Metalist",
      "Completed",
      production.metalist.assignedTo,
      "Metal work completed"
    );

    await employeeCompleted(
      production.metalist.assignedTo
    );

    await updateEmployeeWorkingStatus(
      production.metalist.assignedTo,
      "metalist"
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Metal work completed successfully.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Ceramist
// ─────────────────────────────────────────────────────────────────────────

/**
 * Assign Ceramist
 */
export const assignCeramist = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const ceramist = req.body.ceramist?.trim();

    if (!ceramist) {
      return res.status(400).json({
        success: false,
        message: "Ceramist is required.",
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

    if (production.ceramist.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Ceramist has already been assigned.",
      });
    }

    production.ceramist.assignedTo = ceramist;
    production.ceramist.assignedAt = new Date();

    production.currentStage = "Ceramist";

    addActivity(
      production,
      "Ceramist",
      "Ceramist Assigned",
      ceramist,
      `${ceramist} assigned to this case`
    );

    await employeeAssigned(ceramist);

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Ceramist assigned successfully.",
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

/**
 * Start Ceramist Work
 */
export const startCeramist = async (req: Request, res: Response) => {
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

    if (!production.ceramist.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Assign a ceramist before starting.",
      });
    }

    if (production.ceramist.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Ceramist work has already started.",
      });
    }

    order.status = "Ceramist";

    production.currentStage = "Ceramist";

    production.ceramist.startedAt = new Date();

    addActivity(
      production,
      "Ceramist",
      "Started",
      production.ceramist.assignedTo,
      "Ceramist work started"
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Ceramist work started successfully.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Complete Ceramist Work
 */
export const completeCeramist = async (req: Request, res: Response) => {
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

    if (!production.ceramist.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Ceramist work has not been started yet.",
      });
    }

    if (production.ceramist.completedAt) {
      return res.status(400).json({
        success: false,
        message: "Ceramist work has already been completed.",
      });
    }

    production.ceramist.completedAt = new Date();

    production.currentStage = "QC";

    order.status = "QC";

    addActivity(
      production,
      "Ceramist",
      "Completed",
      production.ceramist.assignedTo,
      "Ceramist work completed"
    );

    await employeeCompleted(
      production.ceramist.assignedTo
    );

    await updateEmployeeWorkingStatus(
      production.ceramist.assignedTo,
      "ceramist"
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Ceramist work completed successfully.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// QC
// ─────────────────────────────────────────────────────────────────────────

/**
 * Assign QC Employee
 */
export const assignQC = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const qc = req.body.qc?.trim();

    if (!qc) {
      return res.status(400).json({
        success: false,
        message: "QC employee is required.",
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const production = ensureProduction(order);

    if (production.qc.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "QC already assigned.",
      });
    }

    production.qc.assignedTo = qc;
    production.qc.assignedAt = new Date();

    production.currentStage = "QC";

    addActivity(
      production,
      "QC",
      "QC Assigned",
      qc,
      `${qc} assigned to this case`
    );

    await employeeAssigned(qc);

    await order.save();

    return res.status(200).json({
      success: true,
      message: "QC assigned successfully.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Start QC
 */
export const StartQC = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const production = ensureProduction(order);

    if (!production.qc.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Assign QC before starting.",
      });
    }

    if (production.qc.startedAt) {
      return res.status(400).json({
        success: false,
        message: "QC has already started.",
      });
    }

    order.status = "QC";

    production.currentStage = "QC";

    production.qc.startedAt = new Date();

    addActivity(
      production,
      "QC",
      "Started",
      production.qc.assignedTo,
      "QC started"
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "QC started successfully.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Complete QC
 */
export const completeQC = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const production = ensureProduction(order);

    if (!production.qc.startedAt) {
      return res.status(400).json({
        success: false,
        message: "QC has not been started yet.",
      });
    }

    if (production.qc.completedAt) {
      return res.status(400).json({
        success: false,
        message: "QC has already been completed.",
      });
    }

    production.qc.completedAt = new Date();

    production.currentStage = "Dispatch";

    order.status = "Dispatch";

    addActivity(
      production,
      "QC",
      "Completed",
      production.qc.assignedTo,
      "QC completed"
    );

    await employeeCompleted(
      production.qc.assignedTo
    );

    await updateEmployeeWorkingStatus(
      production.qc.assignedTo,
      "qc"
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "QC completed successfully.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Dispatch
// ─────────────────────────────────────────────────────────────────────────

/**
 * Assign Dispatcher
 */
export const assignDispatch = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const dispatcher = req.body.dispatcher?.trim();

    if (!dispatcher) {
      return res.status(400).json({
        success: false,
        message: "Dispatcher is required.",
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const production = ensureProduction(order);

    if (production.dispatch.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Dispatcher already assigned.",
      });
    }

    production.dispatch.assignedTo = dispatcher;
    production.dispatch.assignedAt = new Date();

    production.currentStage = "Dispatch";

    addActivity(
      production,
      "Dispatch",
      "Dispatcher Assigned",
      dispatcher,
      `${dispatcher} assigned to this case`
    );

    await employeeAssigned(dispatcher);

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Dispatcher assigned successfully.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Start Dispatch
 */
export const startDispatch = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const production = ensureProduction(order);

    if (!production.dispatch.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Assign dispatcher first.",
      });
    }

    if (production.dispatch.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Dispatch already started.",
      });
    }

    order.status = "Dispatch";

    production.currentStage = "Dispatch";

    production.dispatch.startedAt = new Date();

    addActivity(
      production,
      "Dispatch",
      "Started",
      production.dispatch.assignedTo,
      "Dispatch started"
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Dispatch started successfully.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Complete Dispatch
 */
export const completeDispatch = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const production = ensureProduction(order);

    if (!production.dispatch.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Dispatch has not started.",
      });
    }

    if (production.dispatch.completedAt) {
      return res.status(400).json({
        success: false,
        message: "Dispatch already completed.",
      });
    }

    production.dispatch.completedAt = new Date();

    production.currentStage = "Delivered";

    order.status = "Delivered";

    addActivity(
      production,
      "Dispatch",
      "Completed",
      production.dispatch.assignedTo,
      "Dispatch completed"
    );

    await employeeCompleted(
      production.dispatch.assignedTo
    );

    await updateEmployeeWorkingStatus(
      production.dispatch.assignedTo,
      "dispatch"
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Dispatch completed successfully.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Delivered
// ─────────────────────────────────────────────────────────────────────────

/**
 * Mark Delivered
 */
export const markDelivered = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const production = ensureProduction(order);

    if (!production.dispatch.completedAt) {
      return res.status(400).json({
        success: false,
        message: "Complete Dispatch first.",
      });
    }

    if (production.delivery?.deliveredAt) {
      return res.status(400).json({
        success: false,
        message: "Order already delivered.",
      });
    }

    production.delivery.deliveredAt = new Date();

    production.currentStage = "Delivered";

    order.status = "Delivered";

    addActivity(
      production,
      "Delivered",
      "Order Delivered",
      production.dispatch.assignedTo,
      "Case delivered successfully"
    );

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order marked as Delivered.",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};