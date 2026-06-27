import { Request, Response } from "express";
import Device from "../models/Device";

export const updateDevice = async (req: Request, res: Response) => {
  try {
    const { deviceId, clinicName, latitude, longitude, city, battery, status } = req.body;

    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        clinicName,
        latitude,
        longitude,
        city,
        battery,
        status,
        lastSeen: new Date(),
      },
      {
        upsert: true,
        new: true,
      },
    );

    res.json(device);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update device",
    });
  }
};

export const getDevices = async (req: Request, res: Response) => {
  const devices = await Device.find();
  res.json(devices);
};
export const getDeviceById = async (req: Request, res: Response) => {
  try {
    const device = await Device.findOne({
      deviceId: req.params.deviceId,
    });

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    res.json(device);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch device",
    });
  }
};
