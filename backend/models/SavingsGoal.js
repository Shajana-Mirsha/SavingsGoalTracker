const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  goalName: String,
  targetAmount: Number,
  savedAmount: { type: Number, default: 0 },
  deadline: { type: Date }, // Ensure this is present
  history: [
    {
      amount: Number,
      date: { type: Date, default: Date.now }
    }
  ],
  isDeleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);