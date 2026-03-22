import express from "express";
import { auth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import {
  upsertMyMaintenanceProfile,
  listMaintenanceProviders,
} from "../../controllers/maintenance/maintenanceProviderController.js";

const router = express.Router();

// maintenance user creates/updates profile
router.post("/me", auth, requireRole("maintenance"), upsertMyMaintenanceProfile);

// owner lists providers (optionally filter by category)
router.get("/", auth, requireRole("owner"), listMaintenanceProviders);

export default router;