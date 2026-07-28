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
    patientName: {
      type: String,
      required: true,
    },

    patientAge: {
      type: Number,
      required: true,
    },

    clinic: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      default: "",
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

    production: {
      currentStage: {
        type: String,
        enum: [
          "Received",
          "Designing",
          "Printing",
          "Ceramist",
          "QC",
          "Dispatch",
          "Delivered",
        ],
        default: "Received",
      },

      designer: {
        assignedTo: {
          type: String,
          default: "",
        },
        assignedAt: Date,
        startedAt: Date,
        completedAt: Date,
      },

      printing: {
        assignedTo: {
          type: String,
          default: "",
        },
        startedAt: Date,
        completedAt: Date,
      },

      ceramist: {
        assignedTo: {
          type: String,
          default: "",
        },
        startedAt: Date,
        completedAt: Date,
      },

      qc: {
        approvedBy: {
          type: String,
          default: "",
        },
        approvedAt: Date,
        remarks: {
          type: String,
          default: "",
        },
      },

      dispatch: {
        courier: {
          type: String,
          default: "",
        },
        trackingId: {
          type: String,
          default: "",
        },
        dispatchedAt: Date,
      },

      activity: [
        {
          stage: String,
          action: String,
          user: String,
          note: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },

  {
    timestamps: true,
  },
);

// ==========================
// Performance Indexes
// ==========================

// Search orders by clinic
orderSchema.index({ clinic: 1 });

// Search by designer
orderSchema.index({ designer: 1 });

// Filter by order status
orderSchema.index({ status: 1 });

// Filter by payment status
orderSchema.index({ paymentStatus: 1 });

// Search by product
orderSchema.index({ product: 1 });

// Recent orders
orderSchema.index({ createdAt: -1 });

// Delivery tracking
orderSchema.index({ deliveryDate: 1 });

// Frequently used dashboard query
orderSchema.index({
  clinic: 1,
  status: 1,
  createdAt: -1,
});

// Production stage tracking
orderSchema.index({
  "production.currentStage": 1,
});

// Designer workload lookups
orderSchema.index({
  "production.designer.assignedTo": 1,
});

export default mongoose.model("Order", orderSchema);