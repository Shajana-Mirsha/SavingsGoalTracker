const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const passport = require("passport");

dotenv.config();

// ✅ CREATE APP FIRST
const app = express();

// ✅ MIDDLEWARES
app.use(cors());
app.use(express.json());

// ✅ INITIALIZE PASSPORT AFTER app IS CREATED
require("./config/passport");
app.use(passport.initialize());

// ✅ DATABASE
const connectDB = require("./config/db");
connectDB();

// ✅ ROUTES
const authRoutes = require("./routes/authRoutes");
const goalRoutes = require("./routes/goalRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/user", userRoutes);
app.use("/api/bank", require("./routes/bankRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// ✅ 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ✅ GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Vault Goal Server running on port ${PORT}`);
});
