// Simple auth middleware (replace with JWT later)
// Expect header: x-user-id

export const auth = (req, res, next) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: x-user-id header required" });
  }
  req.user = { id: userId }; // minimal
  next();
};