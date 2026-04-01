const express = require("express");
const multer = require("multer");
const medicineController = require("../controllers/medicineController");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
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

router.get("/", medicineController.getAllMedicines);
router.get("/:id", medicineController.getMedicineById);

// Admin route
router.post("/", ensureAuth, ensureAdmin, upload.single("image"), medicineController.createMedicine);

module.exports = router;
