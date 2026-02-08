const SavingsGoal = require("../models/SavingsGoal");

const getGoals = async (req, res) => {
  try {
    // Find goals where userId matches the logged-in user
    const goals = await SavingsGoal.find({ userId: req.userId });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching goals" });
  }
};

const createGoal = async (req, res) => {
  try {
    const { goalName, targetAmount } = req.body;
    const newGoal = new SavingsGoal({
      userId: req.userId,
      goalName,
      targetAmount,
      savedAmount: 0,
      history: []
    });
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(500).json({ message: "Server error creating goal" });
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.userId });
    const amount = Number(req.body.savedAmount);

    if (!goal || amount <= 0) {
      return res.status(400).json({ message: "Invalid update or goal not found" });
    }

    goal.savedAmount += amount;
    goal.history.push({ amount, date: new Date() });

    if (goal.savedAmount >= goal.targetAmount && !goal.completedAt) {
      goal.completedAt = new Date();
    }

    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const result = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ message: "Goal not found" });
    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// Exporting all functions as an object to fix the "handler must be a function" error
module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
};