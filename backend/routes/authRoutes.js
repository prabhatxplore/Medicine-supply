const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").optional().trim().isLength({ max: 50 }).withMessage("Name max length is 50 chars"),
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be >= 6 chars"),
  ],
  authController.signup
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").exists().withMessage("Password is required"),
  ],
  authController.login
);

const ensureAuth = (req, res, next) => {
  if (req.session && req.session.isAuth) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
};

router.post("/logout", ensureAuth, authController.logout);
router.get("/me", ensureAuth, authController.me);

module.exports = router;
