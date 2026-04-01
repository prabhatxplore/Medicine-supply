const mongoose = require("mongoose");

const prescriptionRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prescriptionFile: {
      type: String,
      required: true,
    },
    patientNote: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "dispatched"],
      default: "pending",
    },
    /** Admin confirms these before approving */
    verificationChecklist: {
      doctorNameVisible: { type: Boolean, default: false },
      dateReadable: { type: Boolean, default: false },
      signatureOrStampPresent: { type: Boolean, default: false },
    },
    verificationNotes: { type: String, trim: true, default: "" },
    rejectionReason: { type: String, trim: true, default: "" },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: { type: Date, default: null },
    dispatchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    dispatchedAt: { type: Date, default: null },
    dispatchNotes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

prescriptionRequestSchema.index({ user: 1, createdAt: -1 });
prescriptionRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("PrescriptionRequest", prescriptionRequestSchema);
