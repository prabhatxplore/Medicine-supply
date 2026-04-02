const express = require("express");
const multer = require("multer");
const prescriptionController = require("../controllers/prescriptionController");
const { ensureAuth } = require("../middlewares/ensureAuth");
const ensureAdmin = require("../middlewares/ensureAdmin");
const { createStorage } = require("../config/cloudinary");

const router = express.Router();

const upload = multer({
  storage: createStorage("prescriptions"),
  limits: { fileSize: 5 * 1024 * 1024 },
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
