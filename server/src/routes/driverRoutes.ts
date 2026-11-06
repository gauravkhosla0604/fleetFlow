import express from "express";

import {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from "../controllers/driverController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getDrivers);

router.get("/:id", protect, getDriverById);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createDriver
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateDriver
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteDriver
);

export default router;