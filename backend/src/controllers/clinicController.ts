import { Request, Response } from "express";
import Clinic from "../models/Clinic";

export const createClinic = async (req: Request, res: Response) => {
  try {
    const clinic = await Clinic.create(req.body);

    res.status(201).json(clinic);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create clinic",
    });
  }
};

export const getClinics = async (req: Request, res: Response) => {
  try {
    const clinics = await Clinic.find({
      isApproved: true,
    });

    res.json(clinics);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch clinics",
    });
  }
};
export const getAllClinics = async (req: Request, res: Response) => {
  try {
    const clinics = await Clinic.find().sort({
      createdAt: -1,
    });

    res.json(clinics);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch clinics",
    });
  }
};

export const approveClinic = async (req: Request, res: Response) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
      },
      {
        new: true,
      },
    );

    res.json(clinic);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Approval failed",
    });
  }
};

export const rejectClinic = async (req: Request, res: Response) => {
  try {
    await Clinic.findByIdAndDelete(req.params.id);

    res.json({
      message: "Clinic rejected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Reject failed",
    });
  }
};
export const updateClinicLocation = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      {
        latitude,
        longitude,
      },
      {
        new: true,
      },
    );

    res.json(clinic);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update location",
    });
  }
};
