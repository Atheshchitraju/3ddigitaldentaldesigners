import mongoose, { Schema, Document } from "mongoose";

interface Doctor {
  name: string;
  qualification: string;
  specializations: string[];
  yearsOfExperience?: number;
  registrationNumber: string;

  imageUrl?: string;
  certificateUrls?: string[];
}

export interface IPartnerApplication extends Document {
  clinicName: string;
  ownerName: string;
  yearEstablished: number;

  address: string;
  city: string;
  state: string;
  pincode: string;

  website?: string;
  socialMediaLink?: string;

  primaryContactPerson: string;
  designation: string;

  mobileNumber: string;
  whatsappNumber: string;
  email: string;

  numberOfDoctors: number;
  doctors: Doctor[];

  currentWorkflow?: string;

  interestedServices: string[];

  worksWithDigitalLab?: "Yes" | "No";

  latitude?: number;
  longitude?: number;

  clinicLogoUrl?: string;
  clinicPhotoUrls?: string[];

  declaration: boolean;

  status: "Pending" | "Approved" | "Rejected";

  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<Doctor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    qualification: {
      type: String,
      required: true,
      trim: true,
    },

    specializations: {
      type: [String],
      required: true,
      default: [],
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
    },

    registrationNumber: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    certificateUrls: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const partnerApplicationSchema =
  new Schema<IPartnerApplication>(
    {
      clinicName: {
        type: String,
        required: true,
        trim: true,
      },

      ownerName: {
        type: String,
        required: true,
        trim: true,
      },

      yearEstablished: {
        type: Number,
        required: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },

      website: {
        type: String,
        default: "",
      },

      socialMediaLink: {
        type: String,
        default: "",
      },

      primaryContactPerson: {
        type: String,
        required: true,
        trim: true,
      },

      designation: {
        type: String,
        required: true,
      },

      mobileNumber: {
        type: String,
        required: true,
      },

      whatsappNumber: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      numberOfDoctors: {
        type: Number,
        required: true,
        min: 1,
      },

      doctors: {
        type: [doctorSchema],
        required: true,
        default: [],
      },

      currentWorkflow: {
        type: String,
        default: "",
      },

      interestedServices: {
        type: [String],
        required: true,
        default: [],
      },

      worksWithDigitalLab: {
        type: String,
        enum: ["Yes", "No"],
        default: undefined,
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },

      clinicLogoUrl: {
        type: String,
        default: "",
      },

      clinicPhotoUrls: {
        type: [String],
        default: [],
      },

      declaration: {
        type: Boolean,
        required: true,
      },

      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },

      reviewedAt: {
        type: Date,
      },

      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
    {
      timestamps: true,
    },
  );

export default mongoose.model<IPartnerApplication>(
  "PartnerApplication",
  partnerApplicationSchema,
);