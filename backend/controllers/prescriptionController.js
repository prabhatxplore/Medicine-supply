const PrescriptionRequest = require("../models/PrescriptionRequest");

exports.createSubmission = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a prescription file (image or PDF)" });
    }
    const patientNote = typeof req.body.patientNote === "string" ? req.body.patientNote.trim() : "";

    const doc = new PrescriptionRequest({
      user: req.session.userId,
      prescriptionFile: req.file.path,
      patientNote,
      status: "pending",
    });
    await doc.save();
    const populated = await PrescriptionRequest.findById(doc._id).populate("user", "name email");
    res.status(201).json(populated);
  } catch (err) {
    console.error("createSubmission error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.listMine = async (req, res) => {
  try {
    const list = await PrescriptionRequest.find({ user: req.session.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(list);
  } catch (err) {
    console.error("listMine error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.adminStats = async (req, res) => {
  try {
    const pending = await PrescriptionRequest.countDocuments({ status: "pending" });
    const verified = await PrescriptionRequest.countDocuments({ status: "verified" });
    res.json({ pending, verified });
  } catch (err) {
    console.error("adminStats error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.adminList = async (req, res) => {
  try {
    const { status } = req.query;
    const q = {};
    if (status && ["pending", "verified", "rejected", "dispatched"].includes(status)) {
      q.status = status;
    }
    const list = await PrescriptionRequest.find(q)
      .populate("user", "name email phoneNumber")
      .populate("verifiedBy", "email")
      .populate("dispatchedBy", "email")
      .sort({ createdAt: -1 })
      .lean();
    res.json(list);
  } catch (err) {
    console.error("adminList error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verify = async (req, res) => {
  try {
    const {
      verificationNotes,
      doctorNameVisible,
      dateReadable,
      signatureOrStampPresent,
    } = req.body;

    const doc = await PrescriptionRequest.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (doc.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be verified" });
    }

    const d = doctorNameVisible === true || doctorNameVisible === "true";
    const dt = dateReadable === true || dateReadable === "true";
    const sig = signatureOrStampPresent === true || signatureOrStampPresent === "true";

    if (!d || !dt || !sig) {
      return res.status(400).json({
        message:
          "All three checks must pass: doctor name visible, date readable, signature/stamp present. Use Reject if the document is invalid.",
      });
    }

    doc.status = "verified";
    doc.verificationChecklist = {
      doctorNameVisible: true,
      dateReadable: true,
      signatureOrStampPresent: true,
    };
    doc.verificationNotes = typeof verificationNotes === "string" ? verificationNotes.trim() : "";
    doc.verifiedBy = req.session.userId;
    doc.verifiedAt = new Date();
    doc.rejectionReason = "";
    await doc.save();

    const out = await PrescriptionRequest.findById(doc._id)
      .populate("user", "name email phoneNumber")
      .populate("verifiedBy", "email");
    res.json(out);
  } catch (err) {
    console.error("verify error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.reject = async (req, res) => {
  try {
    const reason = typeof req.body.rejectionReason === "string" ? req.body.rejectionReason.trim() : "";
    if (!reason) {
      return res.status(400).json({ message: "Please provide a rejection reason for the patient" });
    }

    const doc = await PrescriptionRequest.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (doc.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be rejected" });
    }

    doc.status = "rejected";
    doc.rejectionReason = reason;
    doc.verifiedBy = req.session.userId;
    doc.verifiedAt = new Date();
    await doc.save();

    const out = await PrescriptionRequest.findById(doc._id).populate("user", "name email");
    res.json(out);
  } catch (err) {
    console.error("reject error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.dispatch = async (req, res) => {
  try {
    const notes = typeof req.body.dispatchNotes === "string" ? req.body.dispatchNotes.trim() : "";

    const doc = await PrescriptionRequest.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (doc.status !== "verified") {
      return res
        .status(400)
        .json({ message: "Only verified prescriptions can be marked as dispatched (medicine sent)" });
    }

    doc.status = "dispatched";
    doc.dispatchedBy = req.session.userId;
    doc.dispatchedAt = new Date();
    doc.dispatchNotes = notes;
    await doc.save();

    const out = await PrescriptionRequest.findById(doc._id)
      .populate("user", "name email phoneNumber")
      .populate("dispatchedBy", "email");
    res.json(out);
  } catch (err) {
    console.error("dispatch error", err);
    res.status(500).json({ message: "Server error" });
  }
};
