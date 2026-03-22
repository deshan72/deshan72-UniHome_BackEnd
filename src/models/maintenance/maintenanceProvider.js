import mongoose from "mongoose";

const maintenanceProviderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    displayName: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },

    categories: [
      {
        type: String,
        enum: [
          "Masons",
          "Carpenters",
          "Plumbers",
          "Electricians",
          "Painters",
          "Welding",
          "A/C",
          "Cleaners",
          "CCTV",
          "Repairs & Others",
        ],
      },
    ],

    serviceAreas: [{ type: String, default: "" }], // e.g., city/area names
    isActive: { type: Boolean, default: true },

    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

maintenanceProviderSchema.index({ isActive: 1 });
maintenanceProviderSchema.index({ categories: 1 });

export default mongoose.model("MaintenanceProvider", maintenanceProviderSchema);