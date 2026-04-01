const express = require("express");
const multer = require("multer");
const orderController = require("../controllers/orderController");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs for prescriptions
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, WebP) and PDF files are allowed for prescriptions"));
    }
  },
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
router.post("/", ensureAuth, upload.single("prescription"), orderController.createOrder);
router.get("/", ensureAuth, orderController.getUserOrders);

module.exports = router;
