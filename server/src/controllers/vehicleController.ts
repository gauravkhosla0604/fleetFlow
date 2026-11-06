import type { Request, Response } from "express";
import Vehicle from "../models/Vehicle.js";

export const createVehicle = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      registrationNumber,
      model,
      type,
      currentMileage,
      lastServiceMileage,
      nextServiceMileage,
    } = req.body;

    if (!registrationNumber || !model || !type) {
      return res.status(400).json({
        message: "Registration number, model and type are required",
      });
    }

    const existingVehicle = await Vehicle.findOne({
      registrationNumber,
    });

    if (existingVehicle) {
      return res.status(400).json({
        message: "Vehicle already exists",
      });
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      model,
      type,
      currentMileage,
      lastServiceMileage,
      nextServiceMileage,
    });

    return res.status(201).json({
      message: "Vehicle created successfully",
      vehicle,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getVehicles = async (
  req: Request,
  res: Response
) => {
  try {
    const vehicles = await Vehicle.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      vehicles,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getVehicleById = async (
  req: Request,
  res: Response
) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      vehicle,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const updateVehicle = async (
  req: Request,
  res: Response
) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const deleteVehicle = async (
  req: Request,
  res: Response
) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(
      req.params.id
    );

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};