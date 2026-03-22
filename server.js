import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./src/config/mongoDb.js";
import apiRoutes from "./src/index.js";
import repairRequestRoutes from "./src/routes/maintenance/repairRequestRoutes.js";
import maintenanceProviderRoutes from "./src/routes/maintenance/maintenanceProviderRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
  // Maintenance module
  app.use("/api/maintenance/repair-requests", repairRequestRoutes);
  app.use("/api/maintenance/providers", maintenanceProviderRoutes);

