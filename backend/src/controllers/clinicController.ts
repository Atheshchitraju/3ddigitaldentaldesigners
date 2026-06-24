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
