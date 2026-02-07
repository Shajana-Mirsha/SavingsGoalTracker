const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  goalName: String,
  targetAmount: Number,
  savedAmount: { type: Number, default: 0 },

  history: [
    {
      amount: Number,
      date: { type: Date, default: Date.now }
    }
  ],

  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);
