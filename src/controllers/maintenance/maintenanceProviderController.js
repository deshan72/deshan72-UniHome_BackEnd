import MaintenanceProvider from "../../models/maintenance/maintenanceProvider.js";

// Create/Update provider profile (maintenance user)
export const upsertMyMaintenanceProfile = async (req, res) => {
  try {
    const { displayName, phone, email, categories, serviceAreas } = req.body;

    if (!displayName) return res.status(400).json({ message: "displayName is required" });

    const updated = await MaintenanceProvider.findOneAndUpdate(
      { user: req.user.id },
      {
        user: req.user.id,
        displayName,
        phone: phone || "",
        email: email || "",
        categories: Array.isArray(categories) ? categories : [],
        serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : [],
        isActive: true,
      },
      { upsert: true, new: true }
    );

    res.json({ message: "Maintenance profile saved", data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public list for owners to select (filter by category)
export const listMaintenanceProviders = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) query.categories = category;

    const list = await MaintenanceProvider.find(query).sort({ createdAt: -1 });
    res.json({ data: list });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};