const Medicine = require("../models/Medicine");

exports.getAllMedicines = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Add category filter if specified and not "All"
    if (category && category !== 'All') {
      query.categories = { $in: [category] };
    }

    const medicines = await Medicine.find(query);
    res.json(medicines);
  } catch (err) {
    console.error("getAllMedicines error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    res.json(medicine);
  } catch (err) {
    console.error("getMedicineById error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin functions (for now, simple)
exports.createMedicine = async (req, res) => {
  const { name, description, price, quantity, requiresPrescription, tags, categories } = req.body;
  try {
    const parsedTags = Array.isArray(tags)
      ? tags.map((tag) => tag.trim()).filter((tag) => tag)
      : typeof tags === "string"
      ? tags.split(",").map((tag) => tag.trim()).filter((tag) => tag)
      : [];

    const parsedCategories = Array.isArray(categories)
      ? categories.filter(c => ["Pain Relief", "Cold & Cough", "Vitamins", "Antibiotics"].includes(c))
      : [];

    const newMedicine = new Medicine({
      name,
      description,
      price,
      quantity,
      requiresPrescription,
      tags: parsedTags,
      categories: parsedCategories,
    });
    if (req.file) {
      newMedicine.image = req.file.path;
    }
    await newMedicine.save();
    res.status(201).json(newMedicine);
  } catch (err) {
    console.error("createMedicine error", err);
    res.status(500).json({ message: "Server error" });
  }
};
