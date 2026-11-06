import type { Request, Response } from "express";
import Maintenance from "../models/Maintenance.js";
import Vehicle from "../models/Vehicle.js";

export const logMaintenance = async (req: Request, res: Response) => {
  try {
    const { vehicleId, serviceDate, cost, notes, odometerReading } = req.body;

    if (!vehicleId || !serviceDate || cost === undefined || !notes || odometerReading === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    if (vehicle.status === "on_trip") {
      return res.status(400).json({ message: "Cannot send vehicle to maintenance while on an active trip." });
    }

    const log = await Maintenance.create({
      vehicleId,
      serviceDate,
      cost,
      notes,
      odometerReading,
    });

    vehicle.status = "maintenance";
    if (Number(odometerReading) > (vehicle.currentMileage || 0)) {
      vehicle.currentMileage = Number(odometerReading);
    }
    await vehicle.save();

    return res.status(201).json({ message: "Vehicle sent to maintenance successfully", log, vehicle });
  } catch (error) {
    console.error("Maintenance logging error:", error);
    return res.status(500).json({ message: "Server error logging maintenance." });
  }
};

export const completeMaintenance = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    vehicle.status = "available";
    await vehicle.save();

    return res.status(200).json({ message: "Maintenance completed. Vehicle is now available.", vehicle });
  } catch (error) {
    console.error("Complete maintenance error:", error);
    return res.status(500).json({ message: "Server error completing maintenance." });
  }
};