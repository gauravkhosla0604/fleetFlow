import express from "express";
import { createFuelLog, getFuelLogs } from "../controllers/fuelController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getFuelLogs);
router.post("/", protect, authorizeRoles("admin", "dispatcher"), createFuelLog);

export default router;