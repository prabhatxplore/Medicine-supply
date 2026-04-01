const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    nationalIdCard: {
      type: String, // file path
      default: "",
    },
    citizenshipCard: {
      type: String, // file path
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["unverified", "verified", "rejected"],
      default: "unverified",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    savedAddresses: [
      {
        label: { type: String, trim: true, default: "Address" },
        formattedAddress: { type: String, required: true, trim: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
