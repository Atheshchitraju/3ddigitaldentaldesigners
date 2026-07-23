import { Request, Response } from "express";
import Device from "../models/Device";

export const updateDevice = async (req: Request, res: Response) => {
  try {
    const {
      deviceId,
      clinicName,
      branch,
      latitude,
      longitude,
      city,
      battery,
      status,
    } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        message: "deviceId is required",
      });
    }

    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        clinicName,
        branch,
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
        runValidators: true,
      }
    ).lean();

    return res.status(200).json(device);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update device",
    });
  }
};

export const getDevices = async (req: Request, res: Response) => {
  try {
    const filter: any = {};

    if (req.query.city) {
      filter.city = req.query.city;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const devices = await Device.find(filter)
      .select(
        "deviceId clinicName branch city latitude longitude battery status lastSeen"
      )
      .sort({ clinicName: 1 })
      .lean();

    return res.status(200).json(devices);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch devices",
    });
  }
};

export const getDeviceById = async (req: Request, res: Response) => {
  try {
    const device = await Device.findOne({
      deviceId: req.params.deviceId,
    })
      .select(
        "deviceId clinicName branch city latitude longitude battery status lastSeen"
      )
      .lean();

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    return res.status(200).json(device);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch device",
    });
  }
};