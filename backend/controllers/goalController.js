const SavingsGoal = require("../models/SavingsGoal");
const { processTransaction } = require("./bankController");

const createGoal = async (req, res) => {
  try {
    const { goalName, targetAmount, deadline } = req.body;
    const newGoal = new SavingsGoal({
      userId: req.userId,
      goalName,
      targetAmount,
      deadline,
      savedAmount: 0,
      history: []
    });
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.userId, isDeleted: false });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { savedAmount } = req.body;
    const goal = await SavingsGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    // Deduct from Bank Account
    try {
      await processTransaction({
        userId: req.userId,
        type: "DEBIT",
        amount: Number(savedAmount),
        purpose: `Contribution to ${goal.goalName}`,
        relatedGoalId: goal._id
      });
    } catch (bankErr) {
      return res.status(400).json({ message: bankErr.message });
    }

    goal.savedAmount += Number(savedAmount);
    goal.history.push({ amount: Number(savedAmount), date: new Date() });

    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteGoal = async (req, res) => {
  try {
    await SavingsGoal.findByIdAndDelete(req.params.id);
    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const extendGoalDate = async (req, res) => {
  try {
    const { deadline } = req.body;
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.deadline = deadline;
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  extendGoalDate
};