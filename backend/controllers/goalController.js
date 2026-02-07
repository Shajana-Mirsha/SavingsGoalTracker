const SavingsGoal = require("../models/SavingsGoal");

exports.createGoal = async (req, res) => {
  try {
    const { goalName, targetAmount } = req.body;

    // ✅ VALIDATION
    if (!goalName || !targetAmount) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const goal = await SavingsGoal.create({
      userId: req.userId,        // 👈 THIS WAS THE ISSUE
      goalName,
      targetAmount: Number(targetAmount),
      savedAmount: 0,
      history: []
    });

    res.status(201).json(goal);
  } catch (err) {
    console.error("CREATE GOAL ERROR:", err);
    res.status(500).json({ message: "Failed to create goal" });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.userId });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch goals" });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);
    const amount = Number(req.body.savedAmount);

    if (!goal || amount <= 0) {
      return res.status(400).json({ message: "Invalid update" });
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

exports.deleteGoal = async (req, res) => {
  try {
    await SavingsGoal.findByIdAndDelete(req.params.id);
    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
