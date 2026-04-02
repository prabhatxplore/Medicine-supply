const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");
const authController = require("../controllers/authController");
const addressController = require("../controllers/addressController");
const geoController = require("../controllers/geoController");
const { ensureAuth } = require("../middlewares/ensureAuth");
const ensureAdmin = require("../middlewares/ensureAdmin");
const { createStorage } = require("../config/cloudinary");
const router = express.Router();

const upload = multer({
  storage: createStorage("users"),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/signup",
  upload.fields([
    { name: "nationalIdCard", maxCount: 1 },
    { name: "citizenshipCard", maxCount: 1 },
  ]),
  [
    body("name")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Name max length is 50 chars"),
    body("email")
      .isEmail()
      .withMessage("Valid email required")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be >= 6 chars"),
    body("address")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Address max length is 200 chars"),
    body("phoneNumber")
      .optional()
      .trim()
      .isLength({ min: 10, max: 15 })
      .withMessage("Phone number must be 10-15 digits"),
  ],
  authController.signup,
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email required")
      .normalizeEmail(),
    body("password").exists().withMessage("Password is required"),
  ],
  authController.login,
);

// const ensureAuth = (req, res, next) => {
//   if (req.session && req.session.isAuth) {
//     return next();
//   }
//   return res.status(401).json({ message: "Not authenticated" });
// };

router.post("/logout", ensureAuth, authController.logout);
router.get("/me", ensureAuth, authController.me);

router.get("/addresses", ensureAuth, addressController.listAddresses);
router.post("/addresses", ensureAuth, addressController.addAddress);
router.delete("/addresses/:addressId", ensureAuth, addressController.deleteAddress);

router.get("/geo/reverse", ensureAuth, geoController.reverse);
router.get("/geo/search", ensureAuth, geoController.search);

// Admin Routes
router.get("/admin/users", ensureAuth, ensureAdmin, authController.getAllUsers);
router.put("/admin/users/:id/status", ensureAuth, ensureAdmin, authController.updateUserStatus);

module.exports = router;
