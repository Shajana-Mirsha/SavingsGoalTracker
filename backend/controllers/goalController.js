const SavingsGoal = require("../models/SavingsGoal");

exports.createGoal = async (req, res) => {
  try {
    const { goalName, targetAmount, savedAmount } = req.body;

    const goal = await SavingsGoal.create({
      userId: req.userId,
      goalName,
      targetAmount,
      savedAmount: savedAmount || 0
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { savedAmount } = req.body;
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // ADD to existing saved amount ✅
    goal.savedAmount = goal.savedAmount + Number(savedAmount);

    // Prevent exceeding target
    if (goal.savedAmount > goal.targetAmount) {
      goal.savedAmount = goal.targetAmount;
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteGoal = async (req, res) => {
  try {
    await SavingsGoal.findByIdAndDelete(req.params.id);
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
