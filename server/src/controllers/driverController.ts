import type { Request, Response } from "express";
import Driver from "../models/Driver.js";

export const createDriver = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      phone,
      licenseNumber,
      licenseExpiry,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !licenseNumber ||
      !licenseExpiry
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingDriver = await Driver.findOne({
      $or: [{ email }, { licenseNumber }],
    });

    if (existingDriver) {
      return res.status(400).json({
        message: "Driver already exists",
      });
    }

    const driver = await Driver.create({
      name,
      email,
      phone,
      licenseNumber,
      licenseExpiry,
    });

    return res.status(201).json({
      message: "Driver created successfully",
      driver,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getDrivers = async (
  req: Request,
  res: Response
) => {
  try {
    const drivers = await Driver.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      drivers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getDriverById = async (
  req: Request,
  res: Response
) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      driver,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateDriver = async (
  req: Request,
  res: Response
) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      message: "Driver updated successfully",
      driver,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteDriver = async (
  req: Request,
  res: Response
) => {
  try {
    const driver = await Driver.findByIdAndDelete(
      req.params.id
    );

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      message: "Driver deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

