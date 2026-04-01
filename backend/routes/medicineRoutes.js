const express = require("express");
const multer = require("multer");
const medicineController = require("../controllers/medicineController");
const { ensureAuth } = require("../middlewares/ensureAuth");
const ensureAdmin = require("../middlewares/ensureAdmin");
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

router.get("/", medicineController.getAllMedicines);

// Admin routes (before /:id GET so paths stay unambiguous)
router.post("/", ensureAuth, ensureAdmin, upload.single("image"), medicineController.createMedicine);
router.put("/:id", ensureAuth, ensureAdmin, upload.single("image"), medicineController.updateMedicine);
router.delete("/:id", ensureAuth, ensureAdmin, medicineController.deleteMedicine);

router.get("/:id", medicineController.getMedicineById);

module.exports = router;
