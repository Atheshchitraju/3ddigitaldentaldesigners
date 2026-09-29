import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  accountType: "Clinic" | "Dental Lab";
  organizationName?: string;
  city?: string;

  googleId?: string;
  authProvider: "local" | "google";

  isEmailVerified: boolean;

  passwordResetToken?: string;
  passwordResetExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    accountType: {
      type: String,
      enum: ["Clinic", "Dental Lab"],
      required: true,
    },

    organizationName: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IUser>("User", userSchema);