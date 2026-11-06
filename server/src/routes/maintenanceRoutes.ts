import express from "express";
import { logMaintenance, completeMaintenance } from "../controllers/maintenanceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), logMaintenance);
router.patch("/:vehicleId/complete", protect, authorizeRoles("admin"), completeMaintenance);

export default router;