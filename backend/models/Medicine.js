const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String, // file path
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    categories: {
      type: [String],
      enum: ["Pain Relief", "Cold & Cough", "Vitamins", "Antibiotics"],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

medicineSchema.index({ name: "text", description: "text", tags: "text" });
medicineSchema.index({ categories: 1 });

module.exports = mongoose.model("Medicine", medicineSchema);
