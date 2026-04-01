exports.ensureAuth = (req, res, next) => {
  if (req.session && req.session.isAuth) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
};
