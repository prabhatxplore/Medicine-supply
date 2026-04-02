const User = require("../models/User");

const ensureAdmin = async (req, res, next) => {
  try {
    // Fast path: if session already contains role.
    if (req.session && req.session.role === "admin") return next();

    // Fallback: ensure role is correct based on the persisted user record.
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId).select("role").lean();
      if (user?.role === "admin") return next();
    }

    return res.status(403).json({ message: "Admin access required" });
  } catch (err) {
    console.error("ensureAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = ensureAdmin;