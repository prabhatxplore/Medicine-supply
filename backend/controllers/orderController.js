const Order = require("../models/Order");
const Medicine = require("../models/Medicine");

exports.createOrder = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    // Parse items from FormData (sent as JSON string)
    let items = [];
    if (typeof req.body.items === 'string') {
      items = JSON.parse(req.body.items);
    } else if (Array.isArray(req.body.items)) {
      items = req.body.items;
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];
    let requiresPrescription = false;

    // Validate all medicines and check if prescription is required
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({ message: `Medicine ${item.medicineId} not found` });
      }
      if (medicine.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${medicine.name}` });
      }
      if (medicine.requiresPrescription) {
        requiresPrescription = true;
      }
      orderItems.push({
        medicine: medicine._id,
        quantity: item.quantity,
        price: medicine.price,
      });
      totalAmount += medicine.price * item.quantity;
    }

    // Check if prescription is required and provided
    if (requiresPrescription && !req.file) {
      return res.status(400).json({ 
        message: "Prescription with doctor signature is required for this order",
        requiresPrescription: true 
      });
    }

    const prescriptionPath = req.file ? req.file.path : "";

    const newOrder = new Order({
      user: req.session.userId,
      items: orderItems,
      totalAmount,
      prescription: prescriptionPath,
    });

    await newOrder.save();
    res.status(201).json({ 
      message: "Order placed successfully", 
      order: newOrder 
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
    const orders = await Order.find().populate("user").populate("items.medicine");
    res.json(orders);
  } catch (err) {
    console.error("getAllOrders error", err);
    res.status(500).json({ message: "Server error" });
  }
};
