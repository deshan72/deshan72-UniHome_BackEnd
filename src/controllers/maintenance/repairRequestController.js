import RepairRequest from "../../models/maintenance/repairRequest.js";
// import Accommodation from "../../models/accommodation.js"; // adjust path if different
import MaintenanceProvider from "../../models/maintenance/maintenanceProvider.js";

const buildImageUrls = (req) => {
  const files = req.files || [];
  return files.map((f) => `/${f.path.replace(/\\/g, "/")}`); // windows fix
};

// 1) Student submits repair request
export const createRepairRequest = async (req, res) => {
  try {
    const {   category, description, roomOrUnit } = req.body;
    console.log("Received createRepairRequestcalled and  with data:", req.body);
    // if (!accommodationId || !category || !description) {
    //   return res.status(400).json({ message: "accommodationId, category, description are required" });
    // }

    // const acc = await Accommodation.findById(accommodationId).select("owner");
    // if (!acc) return res.status(404).json({ message: "Accommodation not found" });

    const images = buildImageUrls(req);

    // TODO: Once auth is implemented, use req.user.id instead of null
    const studentId = req.user?.id || null;

    const request = await RepairRequest.create({
      accommodation:  null,
      student: studentId,
      owner: null,
      category: category || "",
      description,
      roomOrUnit: roomOrUnit || "",
      images,
      status: "Pending",
    });

    res.status(201).json({ message: "Repair request submitted", data: request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2) Student view own requests
export const getMyRepairRequests = async (req, res) => {
  try {
    const list = await RepairRequest.find({ student: req.user.id })
      .populate("accommodation", "title location")
      .populate("maintenanceProvider", "displayName categories phone")
      .sort({ createdAt: -1 });

    res.json({ data: list });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3) Owner view requests for owner
export const getOwnerRepairRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { owner: req.user.id };
    if (status) query.status = status;

    const list = await RepairRequest.find(query)
      .populate("student", "name email")
      .populate("accommodation", "title location")
      .populate("maintenanceProvider", "displayName categories phone")
      .sort({ createdAt: -1 });

    res.json({ data: list });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4) Owner approves request
export const approveRepairRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const rr = await RepairRequest.findOne({ _id: id, owner: req.user.id });
    if (!rr) return res.status(404).json({ message: "Repair request not found" });

    if (rr.status !== "Pending") {
      return res.status(400).json({ message: `Cannot approve request in status ${rr.status}` });
    }

    rr.status = "Approved";
    rr.ownerDecision.decidedAt = new Date();
    rr.ownerDecision.note = note || "";
    rr.ownerDecision.rejectionReason = "";
    await rr.save();

    res.json({ message: "Request approved", data: rr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5) Owner rejects request
export const rejectRepairRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, note } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: "rejectionReason is required" });
    }

    const rr = await RepairRequest.findOne({ _id: id, owner: req.user.id });
    if (!rr) return res.status(404).json({ message: "Repair request not found" });

    if (rr.status !== "Pending") {
      return res.status(400).json({ message: `Cannot reject request in status ${rr.status}` });
    }

    rr.status = "Rejected";
    rr.ownerDecision.decidedAt = new Date();
    rr.ownerDecision.note = note || "";
    rr.ownerDecision.rejectionReason = rejectionReason;
    await rr.save();

    res.json({ message: "Request rejected", data: rr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6) Owner selects maintenance provider + booking (after approve)
export const assignMaintenanceProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { maintenanceProviderId, scheduledDate, scheduledTimeSlot, noteToProvider } = req.body;

    if (!maintenanceProviderId) {
      return res.status(400).json({ message: "maintenanceProviderId is required" });
    }

    const rr = await RepairRequest.findOne({ _id: id, owner: req.user.id });
    if (!rr) return res.status(404).json({ message: "Repair request not found" });

    if (!["Approved", "Assigned"].includes(rr.status)) {
      return res.status(400).json({ message: "Request must be Approved before assigning a provider" });
    }

    const provider = await MaintenanceProvider.findById(maintenanceProviderId);
    if (!provider || !provider.isActive) {
      return res.status(404).json({ message: "Maintenance provider not found/Inactive" });
    }

    rr.maintenanceProvider = maintenanceProviderId;
    rr.status = "Assigned";

    rr.booking.scheduledDate = scheduledDate ? new Date(scheduledDate) : undefined;
    rr.booking.scheduledTimeSlot = scheduledTimeSlot || "";
    rr.booking.noteToProvider = noteToProvider || "";
    rr.booking.bookedAt = new Date();

    await rr.save();

    res.json({ message: "Maintenance provider assigned & booked", data: rr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7) Maintenance provider - list assigned jobs (optional)
export const getProviderJobs = async (req, res) => {
  try {
    // Here we expect req.user.id is maintenance user's id and MaintenanceProvider.user = req.user.id
    const provider = await MaintenanceProvider.findOne({ user: req.user.id });
    if (!provider) return res.status(404).json({ message: "MaintenanceProvider profile not found" });

    const list = await RepairRequest.find({ maintenanceProvider: provider._id })
      .populate("student", "name email")
      .populate("accommodation", "title location")
      .sort({ createdAt: -1 });

    res.json({ data: list });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};