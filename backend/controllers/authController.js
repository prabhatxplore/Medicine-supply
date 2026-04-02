const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, password, address, phoneNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = {
      name,
      email,
      password: hashedPassword,
      address,
      phoneNumber,
      status: "unverified",
      role: "user",
    };

    if (req.files.nationalIdCard && req.files.nationalIdCard[0]) {
      userData.nationalIdCard = req.files.nationalIdCard[0].path;
    }

    if (req.files.citizenshipCard && req.files.citizenshipCard[0]) {
      userData.citizenshipCard = req.files.citizenshipCard[0].path;
    }

    const newUser = new User(userData);
    await newUser.save();

    // set session after signup for immediate auth
    req.session.userId = newUser._id;
    req.session.email = newUser.email;
    req.session.isAuth = true;
    req.session.status = newUser.status;
    req.session.role = newUser.role;

    return res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
      email: newUser.email,
      status: newUser.status,
      role: newUser.role,
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
    req.session.status = user.status;
    req.session.role = user.role;

    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
      email: user.email,
      role: user.role,
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

exports.me = async (req, res) => {
  if (req.session && req.session.isAuth) {
    try {
      const user = await User.findById(req.session.userId).select("name email status role").lean();
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Account no longer exists" });
      }

      // Sync session with latest DB values
      req.session.status = user.status;
      req.session.role = user.role;

      return res.json({
        isAuth: true,
        userId: req.session.userId,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
      });
    } catch (err) {
      console.error("me error", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  return res.status(401).json({ message: "Not authenticated" });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (err) {
    console.error("getAllUsers error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!["verified", "unverified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User status updated", user: updatedUser });
  } catch (err) {
    console.error("updateUserStatus error", err);
    return res.status(500).json({ message: "Server error" });
  }
};
