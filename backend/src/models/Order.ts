import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    clinic: {
      type: String,
      required: true,
    },

    clinicEmail: {
      type: String,
    },

    clinicWhatsapp: {
      type: String,
    },

    product: {
      type: String,
      required: true,
    },

    shade: {
      type: String,
    },

    selectedTeeth: {
      type: [Number],
      default: [],
    },

    notes: {
      type: String,
    },

    orderId: {
      type: String,
      unique: true,
    },

    designer: {
      type: String,
      default: "",
    },

    status: {
      type: String,

      enum: ["Placed", "Accepted", "Designing", "Printing", "Completed", "Delivered", "Rejected"],

      default: "Placed",
    },

    deliveryDate: {
      type: String,
    },

    deliveredAt: {
      type: Date,
    },

    remarks: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    paymentMode: {
      type: String,
      enum: ["prepaid", "postpaid"],
      default: "postpaid",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentDetails: {
      razorpayOrderId: {
        type: String,
      },

      razorpayPaymentId: {
        type: String,
      },

      razorpaySignature: {
        type: String,
      },

      paidAt: {
        type: Date,
      },

      refundedAt: {
        type: Date,
      },

      refundId: {
        type: String,
      },

      paymentMethod: {
        type: String,
      },
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model("Order", orderSchema);
