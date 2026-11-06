import express, { Router } from "express";

import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.get("/", protect, getVehicles);

router.get("/:id", protect, getVehicleById);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createVehicle
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateVehicle
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteVehicle
);

export default router;