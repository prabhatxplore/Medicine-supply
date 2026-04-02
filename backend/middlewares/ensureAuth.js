const User = require("../models/User");

exports.ensureAuth = async (req, res, next) => {
  if (!req.session || !req.session.isAuth || !req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await User.findById(req.session.userId).select("_id").lean();
    if (!user) {
      // User was deleted from DB — destroy the stale session
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Account no longer exists" });
    }
    return next();
  } catch (err) {
    console.error("ensureAuth DB check error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
