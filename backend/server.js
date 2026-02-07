const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Savings Goal Tracker API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const goalRoutes = require("./routes/goalRoutes");
app.use("/api/goals", goalRoutes);