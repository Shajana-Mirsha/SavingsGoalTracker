const User = require("../models/User");
const SavingsGoal = require("../models/SavingsGoal");

const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    // Delete all goals of this user
    await SavingsGoal.deleteMany({ userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

module.exports = { deleteAccount };
