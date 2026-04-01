const mongoose = require("mongoose");
const User = require("../models/User");

const MAX_SAVED = 25;

exports.listAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select("savedAddresses").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ addresses: user.savedAddresses || [] });
  } catch (err) {
    console.error("listAddresses error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addAddress = async (req, res) => {
  const label = String(req.body.label || "Address").trim().slice(0, 80);
  const formattedAddress = String(req.body.formattedAddress || "").trim();
  const lat = Number(req.body.lat);
  const lng = Number(req.body.lng);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return res.status(400).json({ message: "Invalid latitude" });
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return res.status(400).json({ message: "Invalid longitude" });
  }
  if (!formattedAddress || formattedAddress.length > 500) {
    return res.status(400).json({ message: "Address text is required (max 500 chars)" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const list = user.savedAddresses || [];
    if (list.length >= MAX_SAVED) {
      return res.status(400).json({ message: `You can save at most ${MAX_SAVED} addresses` });
    }
    const dup = list.some(
      (a) =>
        Math.abs(a.lat - lat) < 1e-5 &&
        Math.abs(a.lng - lng) < 1e-5
    );
    if (dup) {
      return res.status(200).json({ message: "Address already saved", addresses: list });
    }
    user.savedAddresses.push({ label, formattedAddress, lat, lng });
    await user.save();
    res.status(201).json({ message: "Address saved", addresses: user.savedAddresses });
  } catch (err) {
    console.error("addAddress error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAddress = async (req, res) => {
  const { addressId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    return res.status(400).json({ message: "Invalid address id" });
  }
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.savedAddresses = (user.savedAddresses || []).filter(
      (a) => String(a._id) !== addressId
    );
    await user.save();
    res.json({ message: "Removed", addresses: user.savedAddresses });
  } catch (err) {
    console.error("deleteAddress error", err);
    res.status(500).json({ message: "Server error" });
  }
};
