const express = require("express");
const multer = require("multer");
const orderController = require("../controllers/orderController");
const { createStorage } = require("../config/cloudinary");

const router = express.Router();

const upload = multer({
  storage: createStorage("orders"),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const ensureAuth = (req, res, next) => {
  if (req.session && req.session.isAuth) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
};

const ensureAdmin = (req, res, next) => {
  if (req.session && req.session.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};

const ensureVolunteer = (req, res, next) => {
  if (req.session && req.session.role === "volunteer") {
    return next();
  }
  return res.status(403).json({ message: "Volunteer access required" });
};

// Admin routes FIRST (more specific)
router.get("/admin/all", ensureAuth, ensureAdmin, orderController.getAllOrders);
router.put("/:id/status", ensureAuth, ensureAdmin, orderController.updateOrderStatus);




// User routes
router.post("/", ensureAuth, (req, res, next) => {
  upload.single("prescription")(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary upload error:", err);
      return res.status(400).json({ message: err.message || "File upload failed" });
    }
    next();
  });
}, orderController.createOrder);
router.get("/", ensureAuth, orderController.getUserOrders);

module.exports = router;
