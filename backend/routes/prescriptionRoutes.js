const express = require("express");
const multer = require("multer");
const prescriptionController = require("../controllers/prescriptionController");
const { ensureAuth } = require("../middlewares/ensureAuth");
const ensureAdmin = require("../middlewares/ensureAdmin");

const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP or PDF allowed"));
    }
  },
});

const ensureCustomer = (req, res, next) => {
  if (!req.session?.isAuth) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.session.role !== "user") {
    return res.status(403).json({ message: "Only customer accounts can upload prescriptions here" });
  }
  next();
};

router.post(
  "/",
  ensureAuth,
  ensureCustomer,
  upload.single("prescription"),
  prescriptionController.createSubmission
);

router.get("/my", ensureAuth, ensureCustomer, prescriptionController.listMine);

router.get("/admin/stats", ensureAuth, ensureAdmin, prescriptionController.adminStats);
router.get("/admin/list", ensureAuth, ensureAdmin, prescriptionController.adminList);

router.patch("/:id/verify", ensureAuth, ensureAdmin, prescriptionController.verify);
router.patch("/:id/reject", ensureAuth, ensureAdmin, prescriptionController.reject);
router.patch("/:id/dispatch", ensureAuth, ensureAdmin, prescriptionController.dispatch);

module.exports = router;
