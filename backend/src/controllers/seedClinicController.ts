import { Request, Response } from "express";
import Clinic from "../models/Clinic";

export const seedClinics = async (
  req: Request,
  res: Response,
) => {
  try {
    await Clinic.deleteMany({});

    const clinics = req.body;

    await Clinic.insertMany(clinics);

    res.json({
      message: "Clinics seeded successfully",
      count: clinics.length,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Seed failed",
    });
  }
};