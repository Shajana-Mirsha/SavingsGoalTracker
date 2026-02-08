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

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
