import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            unique: true,
        },

        name: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        phone: {
            type: String,
            default: "",
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["Admin", "Employee"],
            default: "Employee",
        },

        department: {
            type: String,
            enum: [
                "Designer",
                "Printer",
                "Metalist",
                "Ceramist",
                "QC",
                "Dispatch",
            ],
            required: function () {
                return this.role === "Employee";
            },
        },

        workingStatus: {
            type: String,
            enum: ["Available", "Busy", "Leave"],
            default: "Available",
        },

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },

        profileImage: {
            type: String,
            default: "",
        },

        assignedOrders: {
            type: Number,
            default: 0,
        },

        completedOrders: {
            type: Number,
            default: 0,
        },

        joinedDate: {
            type: Date,
            default: Date.now,
        },

        lastLogin: Date,

        lastSeen: Date,
    },
    {
        timestamps: true,
    }
);

employeeSchema.index({ role: 1, status: 1 });
employeeSchema.index({ department: 1, workingStatus: 1 });

export default mongoose.model("Employee", employeeSchema);