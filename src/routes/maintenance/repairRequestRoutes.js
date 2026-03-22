import express from "express";
import {
  createRepairRequest,
  getMyRepairRequests,
  getOwnerRepairRequests,
  approveRepairRequest,
  rejectRepairRequest,
  assignMaintenanceProvider,
  getProviderJobs,
} from "../../controllers/maintenance/repairRequestController.js";

import { auth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { uploadRepairImages } from "../../middleware/upload.js";

const router = express.Router();

// Student
router.post("/", createRepairRequest); // TODO: Add auth, requireRole("student"), uploadRepairImages once auth is implemented
router.get("/my", auth, requireRole("student"), getMyRepairRequests);

// Owner
router.get("/owner", auth, requireRole("owner"), getOwnerRepairRequests);
router.patch("/:id/approve", auth, requireRole("owner"), approveRepairRequest);
router.patch("/:id/reject", auth, requireRole("owner"), rejectRepairRequest);
router.patch("/:id/assign", auth, requireRole("owner"), assignMaintenanceProvider);

// Maintenance provider
router.get("/provider/jobs", auth, requireRole("maintenance"), getProviderJobs);

export default router;