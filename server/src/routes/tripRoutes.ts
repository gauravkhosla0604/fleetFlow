import express from "express";
import {
  createTrip,
  getTrips,
  updateTripStatus,
  getMyTrips,
  updateMyTripStatus,
} from "../controllers/tripController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getTrips);
router.get("/my-trips", protect, authorizeRoles("driver"), getMyTrips);
router.post("/", protect, authorizeRoles("admin", "dispatcher"), createTrip);
router.patch("/:id/status", protect, authorizeRoles("admin", "dispatcher"), updateTripStatus);
router.patch("/:id/driver-status", protect, authorizeRoles("driver"), updateMyTripStatus);

export default router;