const Medicine = require("../models/Medicine");

exports.getAllMedicines = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    const normalizedSearch = typeof search === "string" ? search.trim() : "";

    // Build search query against current schema fields.
    if (normalizedSearch) {
      const escaped = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escaped, "i");
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { categories: searchRegex },
      ];
    }

    // Add category filter if specified and not "All"
    if (category && category !== "All") {
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
  const {
    name,
    description,
    price,
    quantity,
    requiresPrescription,
    tags,
    categories,
  } = req.body;
  try {
    const parsedTags = Array.isArray(tags)
      ? tags.map((tag) => tag.trim()).filter((tag) => tag)
      : typeof tags === "string"
      ? tags.split(",").map((tag) => tag.trim()).filter((tag) => tag)
      : [];

    const allowedCategories = [
      "Pain Relief",
      "Cold & Cough",
      "Vitamins",
      "Antibiotics",
    ];
    const parsedCategories = Array.isArray(categories)
      ? categories
      : typeof categories === "string"
      ? categories.split(",")
      : [];
    const normalizedCategories = parsedCategories
      .map((c) => c.trim())
      .filter((c) => allowedCategories.includes(c));

    const newMedicine = new Medicine({
      name,
      description,
      price,
      quantity,
      requiresPrescription,
      tags: parsedTags,
      categories: normalizedCategories,
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

exports.deleteMedicine = async (req, res) => {
  try {
    const deletedMedicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!deletedMedicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    res.json({ message: "Medicine deleted successfully" });
  } catch (err) {
    console.error("deleteMedicine error", err);
    res.status(500).json({ message: "Server error" });
  }
};
