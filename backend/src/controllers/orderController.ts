import { Request, Response } from "express";
import Order from "../models/Order";
import { sendWhatsAppMessage } from "../services/whatsappService";

// CREATE ORDER

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      patientName,
      patientAge,
      clinic,
      clinicEmail,
      clinicWhatsapp,
      product,
      shade,
      selectedTeeth,
      notes,

      amount,
      quantity,

      paymentMode,
      paymentStatus,

      paymentDetails,
    } = req.body;

    const orderId = `ORD-${Date.now()}`;

    const order = await Order.create({
      name,
      phone,
      patientName,
      patientAge,
      clinic,
      clinicEmail,
      clinicWhatsapp,
      product,
      shade,
      selectedTeeth,
      notes,

      amount,
      quantity,

      paymentMode,
      paymentStatus,

      paymentDetails,

      orderId,
    });

    // SEND ORDER RECEIVED MESSAGE

    try {
      // CUSTOMER WHATSAPP

      if (clinicWhatsapp) {
        console.log("Sending customer WhatsApp...");

        await sendWhatsAppMessage(
          clinicWhatsapp,

          `🦷 3D Digital Dental Designers

Your order has been received successfully.

📌 Order ID:
${orderId}

👤 Patient:
${patientName}

🎂 Age:
${patientAge}

🏥 Clinic:
${clinic}

🦷 Product:
${product}

🎨 Shade:
${shade || "Not Selected"}

💰 Amount:
₹${amount * quantity}

📦 Quantity:
${quantity}

We will notify you once production begins.`,
        );

        console.log("CUSTOMER WHATSAPP SENT SUCCESSFULLY");
      }

      // ADMIN WHATSAPP NOTIFICATION

      console.log("SENDING ADMIN WHATSAPP NOTIFICATION...");

      await sendWhatsAppMessage(
        "8217216397",

        `🚨 NEW ORDER RECEIVED

━━━━━━━━━━━━━━━

📌 Order ID:
${orderId}

👤 Patient:
${name}

🏥 Clinic:
${clinic}

📱 Phone:
${phone}

🦷 Product:
${product}

🎨 Shade:
${shade || "Not Selected"}

🦷 Teeth:
${selectedTeeth?.length ? selectedTeeth.join(", ") : "Not Provided"}

📝 Notes:
${notes || "No Notes"}

💰 Amount:
₹${amount * quantity}

📦 Quantity:
${quantity}

━━━━━━━━━━━━━━━

Please check admin dashboard.`,
      );

      console.log("ADMIN WHATSAPP SENT SUCCESSFULLY");
    } catch (whatsappError) {
      console.log("WHATSAPP ERROR:");
      console.log(whatsappError);
    }

    res.status(201).json({
      success: true,
      message: "Order saved successfully",
      order,
    });
  } catch (error: any) {
    console.log("ORDER ERROR:");
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL ORDERS

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.log("GET ORDERS ERROR:");
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE ORDER

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      orderId: id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.log("GET ORDER ERROR:");
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE ORDER STATUS

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    console.log("=================================");
    console.log("STATUS API HIT");
    console.log("REQ PARAMS:", req.params);
    console.log("REQ BODY:", req.body);
    console.log("=================================");

    const { id } = req.params;

    const updateData: any = {
      ...req.body,
    };

    // AUTO SAVE DELIVERY DATE

    if (req.body.status === "Delivered") {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        orderId: id,
      },

      updateData,

      {
        returnDocument: "after",
      },
    );

    if (!updatedOrder) {
      console.log("ORDER NOT FOUND");

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log("ORDER UPDATED SUCCESSFULLY");
    console.log("NEW STATUS:", req.body.status);

    // WHATSAPP STATUS AUTOMATION

    try {
      let message = "";

      // ACCEPTED

      if (req.body.status === "Accepted") {
        message = `🦷 3D Digital Dental Designers

✅ Your Order Has Been Accepted

━━━━━━━━━━━━━━━

📌 Order ID:
${updatedOrder.orderId}

👤 Patient Name:
${updatedOrder.patientName}

Age:
${updatedOrder.patientAge}

🏥 Clinic:
${updatedOrder.clinic}

🦷 Product:
${updatedOrder.product}

🎨 Shade:
${updatedOrder.shade || "Not Selected"}

🦷 Teeth Numbers:
${updatedOrder.selectedTeeth?.length ? updatedOrder.selectedTeeth.join(", ") : "Not Provided"}

📝 Notes:
${updatedOrder.notes || "No Notes"}

━━━━━━━━━━━━━━━

Our production team will begin processing your case shortly.

Thank you for choosing
3D Digital Dental Designers 🙏`;
      }

      // PRINTING
      else if (req.body.status === "Printing") {
        message = `🖨️ 3D Digital Dental Designers

Your order is currently under printing process.

📌 Order ID:
${updatedOrder.orderId}

🦷 Product:
${updatedOrder.product}

We will notify you once printing is completed.`;
      }

      // COMPLETED
      else if (req.body.status === "Completed") {
        message = `✅ 3D Digital Dental Designers

Your dental case has been completed successfully.

📌 Order ID:
${updatedOrder.orderId}

Your order will be dispatched soon.`;
      }

      // DELIVERED
      else if (req.body.status === "Delivered") {
        message = `🚚 3D Digital Dental Designers

Your order has been delivered successfully.

📌 Order ID:
${updatedOrder.orderId}

Thank you for choosing 3D Digital Dental Designers Lab.`;
      }

      // SEND WHATSAPP MESSAGE

      if (message && updatedOrder.clinicWhatsapp) {
        console.log("=================================");
        console.log("Status Changed:", req.body.status);
        console.log("WhatsApp Number:", updatedOrder.clinicWhatsapp);
        console.log("Sending Message:");
        console.log(message);
        console.log("=================================");

        await sendWhatsAppMessage(updatedOrder.clinicWhatsapp, message);

        console.log("WHATSAPP SENT SUCCESSFULLY");
      } else {
        console.log("NO MESSAGE OR WHATSAPP NUMBER FOUND");
      }
    } catch (whatsappError) {
      console.log("WHATSAPP STATUS UPDATE FAILED:");
      console.error(whatsappError);
    }

    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.log("UPDATE ORDER ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
