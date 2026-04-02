require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const orderRoutes = require("./routes/orderRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://medicine-supply-ecru.vercel.app",
    ], // Vite dev server(s) and backend host
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 24 * 3, // 3 days
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
    },
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1);
}

console.log("🔄 Connecting to MongoDB Atlas...");
const PORT = process.env.PORT || 3000;
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4 — fixes most ECONNREFUSED/SRV issues
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    console.log("Mongo database:", mongoose.connection?.name || "unknown");
    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB Atlas:");
    console.error("   Code:", err.code);
    console.error("   Message:", err.message);
    if (err.code === "ECONNREFUSED" || err.code === "ETIMEOUT") {
      console.error("\n📋 Troubleshooting steps:");
      console.error("   1. Go to https://cloud.mongodb.com → Network Access");
      console.error(
        "   2. Click 'Add IP Address' → 'Allow Access from Anywhere' (0.0.0.0/0)",
      );
      console.error("   3. Wait ~30 seconds and restart the server");
      console.error("   4. Also check your internet/VPN connection\n");
    }
    process.exit(1);
  });
