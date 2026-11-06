import type { Request, Response } from "express";
import FuelLog from "../models/FuelLog.js";
import Vehicle from "../models/Vehicle.js";

export const createFuelLog = async (req: Request, res: Response) => {
  try {
    const { vehicleId, date, liters, cost, odometerReading } = req.body;

    if (!vehicleId || !date || !liters || !cost || odometerReading === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    const fuelLog = await FuelLog.create({
      vehicleId,
      date,
      liters: Number(liters),
      cost: Number(cost),
      odometerReading: Number(odometerReading),
    });

    // Automatically update vehicle's current mileage if reading is higher
    if (Number(odometerReading) > (vehicle.currentMileage || 0)) {
      vehicle.currentMileage = Number(odometerReading);
      await vehicle.save();
    }

    return res.status(201).json({ message: "Fuel log recorded successfully", fuelLog });
  } catch (error) {
    console.error("Error creating fuel log:", error);
    return res.status(500).json({ message: "Server error logging fuel." });
  }
};

export const getFuelLogs = async (req: Request, res: Response) => {
  try {
    const fuelLogs = await FuelLog.find()
      .populate("vehicleId", "registrationNumber model currentMileage")
      .sort({ date: -1 });

    return res.status(200).json(fuelLogs);
  } catch (error) {
    console.error("Error fetching fuel logs:", error);
    return res.status(500).json({ message: "Server error fetching fuel logs." });
  }
};