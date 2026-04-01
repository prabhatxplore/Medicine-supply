const Medicine = require("../models/Medicine");

const ALLOWED_CATEGORIES = [
  "Pain Relief",
  "Cold & Cough",
  "Vitamins",
  "Antibiotics",
];

function parseTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function parseCategories(categories) {
  let raw = [];
  if (Array.isArray(categories)) {
    raw = categories;
  } else if (typeof categories === "string") {
    try {
      const j = JSON.parse(categories);
      if (Array.isArray(j)) raw = j;
      else raw = categories.split(",").map((c) => c.trim());
    } catch {
      raw = categories.split(",").map((c) => c.trim());
    }
  }
  return raw.map((c) => c.trim()).filter((c) => ALLOWED_CATEGORIES.includes(c));
}

function parseBool(v) {
  return v === true || v === "true" || v === "1" || v === "on";
}

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

    const medicines = await Medicine.find(query).sort({ name: 1 }).lean();
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
    const parsedTags = parseTags(tags);
    const normalizedCategories = parseCategories(categories);

    const newMedicine = new Medicine({
      name,
      description: description ?? "",
      price: Number(price),
      quantity: Math.max(0, Math.floor(Number(quantity)) || 0),
      requiresPrescription: parseBool(requiresPrescription),
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
    if (err.code === 11000) {
      return res.status(400).json({ message: "A medicine with this name already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    const {
      name,
      description,
      price,
      quantity,
      requiresPrescription,
      tags,
      categories,
    } = req.body;

    if (name !== undefined && String(name).trim()) {
      medicine.name = String(name).trim();
    }
    if (description !== undefined) {
      medicine.description = String(description).trim();
    }
    if (price !== undefined && price !== "") {
      const p = Number(price);
      if (!Number.isFinite(p) || p < 0) {
        return res.status(400).json({ message: "Invalid price" });
      }
      medicine.price = p;
    }
    if (quantity !== undefined && quantity !== "") {
      const q = Math.floor(Number(quantity));
      if (!Number.isFinite(q) || q < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      medicine.quantity = q;
    }
    if (requiresPrescription !== undefined) {
      medicine.requiresPrescription = parseBool(requiresPrescription);
    }
    if (tags !== undefined) {
      medicine.tags = parseTags(tags);
    }
    if (categories !== undefined) {
      medicine.categories = parseCategories(categories);
    }
    if (req.file) {
      medicine.image = req.file.path;
    }

    await medicine.save();
    res.json(medicine);
  } catch (err) {
    console.error("updateMedicine error", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "A medicine with this name already exists" });
    }
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
