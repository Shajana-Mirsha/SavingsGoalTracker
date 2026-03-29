const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE profile (name + email)
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Name and email are required" });

    const existing = await User.findOne({ email, _id: { $ne: req.userId } });
    if (existing) return res.status(400).json({ message: "Email already in use by another account" });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// CHANGE password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both fields are required" });
    if (newPassword.length < 8)
      return res.status(400).json({ message: "New password must be at least 8 characters" });

    const user = await User.findById(req.userId);
    if (!user.password) return res.status(400).json({ message: "Google accounts cannot change password here" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { SavingsGoal, BankAccount, Transaction } = require("../models");
    await SavingsGoal.deleteMany({ userId });
    await BankAccount.deleteMany({ userId });
    await Transaction.deleteMany({ userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: "Account and all data permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete account" });
  }
};

module.exports = { getProfile, updateProfile, changePassword, deleteAccount };
