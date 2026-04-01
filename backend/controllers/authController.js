const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // set session after signup for immediate auth
    req.session.userId = newUser._id;
    req.session.email = newUser.email;
    req.session.isAuth = true;

    return res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
      email: newUser.email,
    });
  } catch (err) {
    console.error("signup error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.userId = user._id;
    req.session.email = user.email;
    req.session.isAuth = true;

    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
      email: user.email,
    });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("logout error", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out" });
  });
};

exports.me = (req, res) => {
  if (req.session && req.session.isAuth) {
    return res.json({
      isAuth: true,
      userId: req.session.userId,
      email: req.session.email,
    });
  }

  return res.status(401).json({ message: "Not authenticated" });
};
