import type { Request, Response } from "express";
import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import Trip from "../models/Trip.js";
import Maintenance from "../models/Maintenance.js";
import FuelLog from "../models/FuelLog.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalVehicles,
      availableVehicles,
      totalDrivers,
      availableDrivers,
      totalTrips,
      completedTrips,
      distanceAggregation,
      maintenanceAggregation,
      fuelAggregation,
    ] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: "available" }),
      Driver.countDocuments(),
      Driver.countDocuments({ status: "available" }),
      Trip.countDocuments(),
      Trip.countDocuments({ status: "completed" }),
      Trip.aggregate([
        { $group: { _id: null, totalDistance: { $sum: "$distance" } } },
      ]),
      Maintenance.aggregate([
        { $group: { _id: null, totalCost: { $sum: "$cost" } } },
      ]),
      FuelLog.aggregate([
        { $group: { _id: null, totalCost: { $sum: "$cost" } }, }
      ]),
    ]);

    const activeTrips = totalTrips - completedTrips;
    const totalDistance =
      distanceAggregation.length > 0 ? distanceAggregation[0].totalDistance : 0;
    const totalMaintenanceCost =
      maintenanceAggregation.length > 0 ? maintenanceAggregation[0].totalCost : 0;
    const totalFuelCost =
      fuelAggregation.length > 0 ? fuelAggregation[0].totalCost : 0;

    const totalOperatingCost = totalMaintenanceCost + totalFuelCost;

    return res.status(200).json({
      vehicles: {
        total: totalVehicles,
        available: availableVehicles,
        onTrip: totalVehicles - availableVehicles,
      },
      drivers: {
        total: totalDrivers,
        available: availableDrivers,
        assigned: totalDrivers - availableDrivers,
      },
      trips: {
        total: totalTrips,
        active: activeTrips,
        completed: completedTrips,
      },
      totalDistance,
      costs: {
        fuel: totalFuelCost,
        maintenance: totalMaintenanceCost,
        operating: totalOperatingCost,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ message: "Server error fetching stats" });
  }
};