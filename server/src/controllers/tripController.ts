import type { Request, Response } from "express";

import Trip from "../models/Trip.js";
import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";

export const createTrip = async (req: Request, res: Response) => {
  try {
    const {
      source,
      destination,
      driverId,
      vehicleId,
      distance,
      scheduledDate,
    } = req.body;

    if (
      !source ||
      !destination ||
      !driverId ||
      !vehicleId ||
      !distance ||
      !scheduledDate
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    // Check if Driver's License is Expired
    if (driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date()) {
      return res.status(400).json({
        message: "Cannot assign trip: Driver's license has expired.",
      });
    }

    if (driver.status !== "available") {
      return res.status(400).json({
        message: "Driver is not available",
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    if (vehicle.status !== "available") {
      return res.status(400).json({
        message: "Vehicle is not available",
      });
    }

    const trip = await Trip.create({
      source,
      destination,
      driverId,
      vehicleId,
      distance,
      scheduledDate,
    });

    driver.status = "assigned";
    vehicle.status = "on_trip";

    await driver.save();
    await vehicle.save();

    return res.status(201).json({
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getTrips = async (req: Request, res: Response) => {
  try {
    const trips = await Trip.find()
      .populate("driverId", "name email")
      .populate("vehicleId", "registrationNumber model")
      .sort({ createdAt: -1 });

    return res.status(200).json(trips);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error fetching trips",
    });
  }
};
export const updateTripStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "completed" or "cancelled"

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.status === "completed" || trip.status === "cancelled") {
      return res.status(400).json({ message: `Trip is already ${trip.status}` });
    }

    trip.status = status;
    await trip.save();

    const driverId = typeof trip.driverId === "object" ? (trip.driverId as any)._id : trip.driverId;
    const vehicleId = typeof trip.vehicleId === "object" ? (trip.vehicleId as any)._id : trip.vehicleId;

    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (driver) {
        driver.status = "available";
        await driver.save();
      }
    }

    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (vehicle) {
        vehicle.status = "available";
        if (status === "completed") {
          vehicle.currentMileage = (vehicle.currentMileage || 0) + (trip.distance || 0);
        }
        await vehicle.save();
      }
    }

    return res.status(200).json({ message: `Trip status updated to ${status}`, trip });
  } catch (error) {
    console.error("Error updating trip status:", error);
    return res.status(500).json({ message: "Server error updating trip status" });
  }
};
export const getMyTrips = async (req: any, res: Response) => {
  try {
    const driver = await Driver.findOne({ email: req.user.email });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found for this user." });
    }

    const trips = await Trip.find({ driverId: driver._id })
      .populate("vehicleId", "registrationNumber model type")
      .sort({ createdAt: -1 });

    return res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching driver trips:", error);
    return res.status(500).json({ message: "Server error fetching assigned trips." });
  }
};

export const updateMyTripStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "in_progress" or "completed"

    const driver = await Driver.findOne({ email: req.user.email });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found." });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    if (trip.driverId.toString() !== driver._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this trip." });
    }

    trip.status = status;
    await trip.save();

    if (status === "completed") {
      driver.status = "available";
      await driver.save();

      const vehicle = await Vehicle.findById(trip.vehicleId);
      if (vehicle) {
        vehicle.status = "available";
        vehicle.currentMileage = (vehicle.currentMileage || 0) + (trip.distance || 0);
        await vehicle.save();
      }
    }

    return res.status(200).json({ message: `Trip updated to ${status}`, trip });
  } catch (error) {
    console.error("Error updating trip status:", error);
    return res.status(500).json({ message: "Server error updating status." });
  }
};