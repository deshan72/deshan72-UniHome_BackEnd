// Simple role middleware (replace with real user fetch/JWT claims)
export const requireRole = (...roles) => {
  return (req, res, next) => {
    const role = req.header("x-user-role"); // student | owner | maintenance
    if (!role) return res.status(401).json({ message: "Unauthorized: x-user-role header required" });

    if (!roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    req.user.role = role;
    next();
  };
};