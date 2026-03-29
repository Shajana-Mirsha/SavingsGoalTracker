const User = require("../models/User");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const SavingsGoal = require("../models/SavingsGoal");
const bcrypt = require("bcryptjs");
const { createAccount, processTransaction } = require("./bankController");

// --- STATS ---
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "USER" });
        const bankAccounts = await BankAccount.find();
        const totalBalance = bankAccounts.reduce((acc, account) => acc + account.balance, 0);
        const totalTransactions = await Transaction.countDocuments();
        const totalGoals = await SavingsGoal.countDocuments();

        res.json({
            totalUsers,
            totalBalance,
            totalTransactions,
            totalGoals
        });
    } catch (err) {
        console.error("ADMIN STATS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// --- USERS ---
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "USER", isDeleted: { $ne: true } }).select("-password").sort({ createdAt: -1 });
        const usersWithDetails = await Promise.all(users.map(async (user) => {
            // Only count active goals
            const goalCount = await SavingsGoal.countDocuments({ userId: user._id, isDeleted: { $ne: true } });
            const account = await BankAccount.findOne({ userId: user._id });
            return {
                ...user.toObject(),
                balance: account ? account.balance : 0,
                goalCount
            };
        }));
        res.json(usersWithDetails);
    } catch (err) {
        console.error("ADMIN USERS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

const createUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "User already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashed, role: role || "USER" });
        await createAccount(user._id);

        res.status(201).json({ message: "User created" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role } = req.body;
        await User.findByIdAndUpdate(id, { email, role });
        res.json({ message: "User updated" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // HARD DELETE per user request

        // 1. Delete Goals
        await SavingsGoal.deleteMany({ userId: id });

        // 2. Delete Bank Account
        await BankAccount.deleteMany({ userId: id });

        // 3. Delete Transactions
        await Transaction.deleteMany({ userId: id });

        // 4. Delete User
        await User.findByIdAndDelete(id);

        res.json({ message: "User and all associated data permanently deleted." });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// --- BANK ACCOUNTS ---
const getAllAccounts = async (req, res) => {
    try {
        const accounts = await BankAccount.find().populate("userId", "email").sort({ balance: -1 });
        res.json(accounts);
    } catch (err) {
        console.error("ADMIN ACCOUNTS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

const updateAccountBalance = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type, purpose } = req.body; // type: CREDIT or DEBIT

        const account = await BankAccount.findById(id);
        if (!account) return res.status(404).json({ message: "Account not found" });

        // Use existing logic for consistency
        await processTransaction({
            userId: account.userId,
            type,
            amount: Number(amount),
            purpose: purpose || "Admin Adjustment",
            relatedGoalId: null
        });

        res.json({ message: "Balance updated successfully" });
    } catch (err) {
        console.error("ADMIN UPDATE BALANCE ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

// --- GOALS ---
const getAllGoals = async (req, res) => {
    try {
        // Enforce isDeleted check compatible with missing field
        const goals = await SavingsGoal.find({ isDeleted: { $ne: true } }).populate("userId", "email").sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

const deleteGoal = async (req, res) => {
    try {
        await SavingsGoal.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.json({ message: "Goal deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

const updateGoal = async (req, res) => {
    try {
        const { goalName, targetAmount, deadline } = req.body;
        await SavingsGoal.findByIdAndUpdate(req.params.id, { goalName, targetAmount, deadline });
        res.json({ message: "Goal updated" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// --- TRANSACTIONS ---
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().populate("userId", "email").sort({ createdAt: -1 }).limit(500);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

const reverseTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const originalTxn = await Transaction.findById(id);
        if (!originalTxn) return res.status(404).json({ message: "Transaction not found" });

        const reverseType = originalTxn.type === "CREDIT" ? "DEBIT" : "CREDIT";

        await processTransaction({
            userId: originalTxn.userId,
            type: reverseType,
            amount: originalTxn.amount,
            purpose: `Reversal of ${originalTxn.transactionId}`,
            relatedGoalId: null
        });

        res.json({ message: "Transaction reversed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getSystemStats,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getAllAccounts,
    updateAccountBalance,
    getAllGoals,
    deleteGoal,
    updateGoal,
    getAllTransactions,
    reverseTransaction
};
