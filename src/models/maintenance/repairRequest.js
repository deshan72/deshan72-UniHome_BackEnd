import mongoose from "mongoose";

const repairRequestSchema = new mongoose.Schema(
  {
    accommodation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accommodation",
      
    },

    roomOrUnit: { type: String, default: "" }, // optional (Room No / Unit No)

    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  

    category: {
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

    description: { type: String, maxlength: 2000 },
    images: [{ type: String }], // store URLs/paths like /uploads/repair-requests/xxx.jpg

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Assigned", "InProgress", "Completed", "Cancelled"],
      default: "Pending",
    },

    ownerDecision: {
      decidedAt: { type: Date },
      note: { type: String, default: "" },
      rejectionReason: { type: String, default: "" },
    },

    // owner selects maintenance provider after approving
    maintenanceProvider: { type: mongoose.Schema.Types.ObjectId, ref: "MaintenanceProvider" },
    booking: {
      scheduledDate: { type: Date },
      scheduledTimeSlot: { type: String, default: "" }, // e.g. "10:00-12:00"
      noteToProvider: { type: String, default: "" },
      bookedAt: { type: Date },
    },
  },
  { timestamps: true }
);

repairRequestSchema.index({ owner: 1, status: 1, createdAt: -1 });
repairRequestSchema.index({ student: 1, status: 1, createdAt: -1 });
// repairRequestSchema.index({ accommodation: 1 });

export default mongoose.model("RepairRequest", repairRequestSchema);