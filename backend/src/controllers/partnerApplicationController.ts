import { Request, Response } from "express";
import mongoose from "mongoose";
import PartnerApplication from "../models/PartnerApplication";
import Clinic from "../models/Clinic";

/**
 * Submit Partner With Us application
 */
export const createPartnerApplication = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      clinicName,
      ownerName,
      yearEstablished,

      address,
      city,
      state,
      pincode,

      website,
      socialMediaLink,

      primaryContactPerson,
      designation,
      mobileNumber,
      whatsappNumber,
      email,

      numberOfDoctors,
      doctors,

      currentWorkflow,
      interestedServices,
      worksWithDigitalLab,

      latitude,
      longitude,

      declaration,
    } = req.body;

    if (
      !clinicName ||
      !ownerName ||
      !yearEstablished ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !primaryContactPerson ||
      !designation ||
      !mobileNumber ||
      !whatsappNumber ||
      !email ||
      !numberOfDoctors ||
      !doctors ||
      !interestedServices ||
      declaration !== true
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required information.",
      });
    }

    const existingPending =
      await PartnerApplication.findOne({
        email: email.toLowerCase(),
        clinicName: clinicName.trim(),
        status: "Pending",
      });

    if (existingPending) {
      return res.status(409).json({
        success: false,
        message:
          "A partnership application for this clinic is already pending.",
      });
    }

    const application =
      await PartnerApplication.create({
        clinicName,
        ownerName,
        yearEstablished,

        address,
        city,
        state,
        pincode,

        website,
        socialMediaLink,

        primaryContactPerson,
        designation,
        mobileNumber,
        whatsappNumber,
        email,

        numberOfDoctors,
        doctors,

        currentWorkflow,
        interestedServices,
        worksWithDigitalLab,

        latitude: latitude
          ? Number(latitude)
          : undefined,

        longitude: longitude
          ? Number(longitude)
          : undefined,

        declaration,

        status: "Pending",
      });

    return res.status(201).json({
      success: true,
      message:
        "Partnership application submitted successfully.",
      applicationId: application._id,
    });
  } catch (error) {
    console.error(
      "Partner application error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit partnership application.",
    });
  }
};


/**
 * Admin: Get pending applications
 */
export const getPendingPartnerApplications =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const applications =
        await PartnerApplication.find({
          status: "Pending",
        }).sort({
          createdAt: -1,
        });

      return res.json({
        success: true,
        applications,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch partnership applications.",
      });
    }
  };


/**
 * Admin: Get single application
 */
export const getPartnerApplication =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const application =
        await PartnerApplication.findById(
          req.params.id,
        );

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found.",
        });
      }

      return res.json({
        success: true,
        application,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch application.",
      });
    }
  };


/**
 * Admin: Approve a partner application
 *
 * On approval, this creates a corresponding Clinic record from the
 * application data and marks the application as "Approved". It does
 * not touch any existing Clinic records.
 */
export const approvePartnerApplication = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await PartnerApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Partner application not found",
      });
    }

    if (application.status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "This application is already approved",
      });
    }

    // Don't allow rejected applications to be accidentally approved
    if (application.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Rejected application cannot be approved",
      });
    }

    /*
     * Check whether this clinic already exists
     *
     * IMPORTANT:
     * We are checking the existing Clinic collection.
     * We are NOT modifying existing clinic records.
     */
    const existingClinic = await Clinic.findOne({
      $or: [
        { phone: application.mobileNumber },
        { name: application.clinicName },
      ],
    });

    if (existingClinic) {
      return res.status(409).json({
        success: false,
        message:
          "A clinic with the same name or phone number already exists.",
        clinicId: existingClinic._id,
      });
    }

    /*
     * Create ONLY the fields required by
     * the existing Clinic collection.
     */
    const clinic = await Clinic.create({
      name: application.clinicName,
      address: application.address,
      phone: application.mobileNumber,
      doctorName: application.doctors?.[0]?.name || "",
      latitude: application.latitude ?? 0,
      longitude: application.longitude ?? 0,
      isApproved: true,
    });

    /*
     * Mark partnership application as approved.
     */
    application.status = "Approved";
    application.reviewedAt = new Date();
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Partner application approved successfully.",
      clinic,
      application,
    });
  } catch (error: any) {
    console.error(
      "Approve partner application error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to approve partner application.",
      error: error.message,
    });
  }
};


/**
 * Admin: Reject a partner application
 */
export const rejectPartnerApplication = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await PartnerApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Partner application not found",
      });
    }

    if (application.status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "An approved application cannot be rejected.",
      });
    }

    application.status = "Rejected";
    application.reviewedAt = new Date();
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Partner application rejected successfully.",
      application,
    });
  } catch (error: any) {
    console.error(
      "Reject partner application error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to reject partner application.",
      error: error.message,
    });
  }
};
/**
 * Public: Get approved partner clinics
 */
export const getApprovedPartnerClinics = async (
  req: Request,
  res: Response,
) => {
  try {
    const applications = await PartnerApplication.find({
      status: "Approved",
    }).sort({
      createdAt: -1,
    });

    const clinics = applications.map((application) => ({
      id: application._id.toString(),

      name: application.clinicName,

      logo: application.clinicLogoUrl || "",

      banner:
        application.clinicPhotoUrls?.[0] ||
        application.clinicLogoUrl ||
        "",

      description: `${application.clinicName} is a dental clinic located in ${application.city}, ${application.state}.`,

      location: [
        application.address,
        application.city,
        application.state,
        application.pincode,
      ]
        .filter(Boolean)
        .join(", "),

      phone: application.mobileNumber,

      email: application.email,

      services: application.interestedServices || [],

      gallery: application.clinicPhotoUrls || [],

      doctors: application.doctors || [],

      latitude: application.latitude ?? 0,

      longitude: application.longitude ?? 0,
    }));

    return res.json({
      success: true,
      clinics,
    });
  } catch (error) {
    console.error(
      "Get approved partner clinics error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch approved partner clinics",
    });
  }
};