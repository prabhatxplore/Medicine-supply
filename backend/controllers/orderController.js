const mongoose = require("mongoose");
const Order = require("../models/Order");
const Medicine = require("../models/Medicine");

function normalizeOrderItems(raw) {
  let items = [];
  if (typeof raw === "string") {
    try {
      items = JSON.parse(raw);
    } catch {
      return null;
    }
  } else if (Array.isArray(raw)) {
    items = raw;
  }
  if (!Array.isArray(items) || items.length === 0) return null;

  const normalized = [];
  for (const row of items) {
    const id = row.medicineId || row.medicine;
    if (!id || !mongoose.Types.ObjectId.isValid(String(id))) {
      return null;
    }
    const qty = Number(row.quantity);
    if (!Number.isFinite(qty) || qty < 1 || qty !== Math.floor(qty)) {
      return null;
    }
    normalized.push({ medicineId: String(id), quantity: qty });
  }
  return normalized;
}

exports.createOrder = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const items = normalizeOrderItems(req.body.items);
    if (!items) {
      return res.status(400).json({ message: "Invalid or empty cart items" });
    }

    let totalAmount = 0;
    const orderItems = [];
    let requiresPrescription = false;
    const snapshot = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId).lean();
      if (!medicine) {
        return res.status(404).json({ message: "One or more products are no longer available" });
      }
      const price = Number(medicine.price);
      const stock = Number(medicine.quantity);
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({ message: `Invalid price for ${medicine.name}` });
      }
      if (!Number.isFinite(stock) || stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${medicine.name}. Only ${Math.max(0, stock)} available.`,
        });
      }
      if (medicine.requiresPrescription) {
        requiresPrescription = true;
      }
      orderItems.push({
        medicine: medicine._id,
        quantity: item.quantity,
        price,
      });
      totalAmount += price * item.quantity;
      snapshot.push({ id: item.medicineId, quantity: item.quantity, name: medicine.name });
    }

    if (requiresPrescription && !req.file) {
      return res.status(400).json({
        message: "Prescription with doctor signature is required for this order",
        requiresPrescription: true,
      });
    }

    const prescriptionPath = req.file ? req.file.path : "";
    const decremented = [];

    for (const row of snapshot) {
      const updated = await Medicine.findOneAndUpdate(
        { _id: row.id, quantity: { $gte: row.quantity } },
        { $inc: { quantity: -row.quantity } },
        { new: true }
      );
      if (!updated) {
        for (const d of decremented) {
          await Medicine.findByIdAndUpdate(d.id, { $inc: { quantity: d.quantity } });
        }
        return res.status(400).json({
          message: `Could not reserve stock for ${row.name}. It may have just sold out—refresh and try again.`,
        });
      }
      decremented.push({ id: row.id, quantity: row.quantity });
    }

    const newOrder = new Order({
      user: req.session.userId,
      items: orderItems,
      totalAmount,
      prescription: prescriptionPath,
    });

    try {
      await newOrder.save();
    } catch (saveErr) {
      for (const d of decremented) {
        await Medicine.findByIdAndUpdate(d.id, { $inc: { quantity: d.quantity } });
      }
      throw saveErr;
    }

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("createOrder error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserOrders = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const orders = await Order.find({ user: req.session.userId }).populate("items.medicine");
    res.json(orders);
  } catch (err) {
    console.error("getUserOrders error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  // Admin function
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error("updateOrderStatus error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  // Admin function - get all orders
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("items.medicine")
      .populate("volunteer", "email name role");
      
    res.json(orders);
  } catch (err) {
    console.error("getAllOrders error", err);
    res.status(500).json({ message: "Server error" });
  }
};

