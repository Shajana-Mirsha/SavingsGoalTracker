const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
// uuid removed to prevent load errors

// Helper to generate 10-digit account number
const generateAccountNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// Helper for atomic transaction
const processTransaction = async ({ userId, type, amount, purpose, relatedGoalId = null, session = null }) => {
    const account = await BankAccount.findOne({ userId }).session(session);
    if (!account) throw new Error("Bank account not found");

    if (type === "DEBIT" && account.balance < amount) {
        throw new Error("Insufficient funds in Vault Bank account");
    }

    // Update Balance
    if (type === "CREDIT") {
        account.balance += amount;
    } else {
        account.balance -= amount;
    }
    await account.save({ session });

    // Create Transaction Record
    const transaction = new Transaction({
        transactionId: "TXN" + Date.now() + Math.floor(Math.random() * 1000), // Simple ID generation
        userId,
        accountId: account._id,
        type,
        amount,
        purpose,
        relatedGoalId,
        balanceAfter: account.balance
    });

    await transaction.save({ session });
    return transaction;
};

// Create Account (Internal Use)
const createAccount = async (userId) => {
    let unique = false;
    let accountNumber = "";

    // Simple check for uniqueness
    while (!unique) {
        accountNumber = generateAccountNumber();
        const exists = await BankAccount.findOne({ accountNumber });
        if (!exists) unique = true;
    }

    const newAccount = new BankAccount({
        userId,
        accountNumber,
        balance: 10000 // Default balance
    });

    await newAccount.save();
    return newAccount;
};

// API: Setup Account (User defined)
// API: Setup Account (User defined)
const logDebug = require("../utils/logger");

// API: Setup Account (User defined)
const setupAccount = async (req, res) => {
    try {
        logDebug(`SETUP START: Body=${JSON.stringify(req.body)} User=${req.userId}`);
        console.log("SETUP DEBUG:", JSON.stringify({ body: req.body, user: req.userId }));

        if (!req.userId) {
            logDebug("Missing userId");
            return res.status(401).json({ message: "User authentication failed" });
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.userId)) {
            logDebug("Invalid ObjectId");
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        const { accountNumber, balance } = req.body;

        if (!accountNumber) {
            logDebug("Missing accountNumber");
            return res.status(400).json({ message: "Please provide account number" });
        }

        const exists = await BankAccount.findOne({ userId: req.userId });
        if (exists) {
            logDebug("Account exists");
            return res.status(400).json({ message: "Account already exists" });
        }

        // Sanitize Input
        const cleanBalance = String(balance).replace(/[^0-9.]/g, '');
        const finalBalance = Number(cleanBalance);
        logDebug(`Sanitized Balance: ${cleanBalance} -> ${finalBalance}`);

        if (isNaN(finalBalance)) {
            logDebug("NaN Balance");
            return res.status(400).json({ message: "Invalid balance format. Numbers only." });
        }

        const newAccount = new BankAccount({
            userId: req.userId,
            accountNumber: String(accountNumber).trim(),
            balance: finalBalance
        });

        await newAccount.save();
        logDebug("Success Save");
        res.status(201).json(newAccount);
    } catch (err) {
        logDebug(`CRASH: ${err.message} \n ${err.stack}`);
        console.error("SETUP ERROR:", err);
        // Return exact error to user for debugging
        if (err.code === 11000) {
            return res.status(400).json({ message: "Account number already in use. Try another." });
        }
        res.status(500).json({ message: "Error: " + err.message });
    }
};

// API: Get Account Details
const getAccount = async (req, res) => {
    try {
        const account = await BankAccount.findOne({ userId: req.userId });
        if (!account) return res.status(404).json({ message: "Account not found" });
        // Return account but never expose the raw PIN hash; send hasPin flag instead
        const { pin, ...rest } = account.toObject();
        res.json({ ...rest, hasPin: !!pin });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// API: Get Transactions
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// API: Manual Credit (For Demo)
const creditAccount = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

        // Use a session if replica set is available, else standard save (atomic at doc level)
        // For simplicity in this demo, we assume single doc operations or no session if standalone
        // But let's try to use the helper helper.

        await processTransaction({
            userId: req.userId,
            type: "CREDIT",
            amount: Number(amount),
            purpose: "Manual Deposit",
        });

        res.json({ message: "Account credited successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message || "Server error" });
    }
};

// SET PIN
const setPin = async (req, res) => {
    try {
        const { pin } = req.body;
        if (!pin || !/^\d{4}$/.test(pin))
            return res.status(400).json({ message: "PIN must be exactly 4 digits" });

        const bcrypt = require("bcryptjs");
        const hashed = await bcrypt.hash(pin, 10);
        const account = await BankAccount.findOneAndUpdate(
            { userId: req.userId },
            { pin: hashed },
            { new: true }
        );
        if (!account) return res.status(404).json({ message: "Bank account not found" });
        res.json({ message: "PIN set successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// VERIFY PIN — issues a short-lived bank session token
const verifyPin = async (req, res) => {
    try {
        const { pin } = req.body;
        const account = await BankAccount.findOne({ userId: req.userId });
        if (!account) return res.status(404).json({ message: "Bank account not found" });
        if (!account.pin) return res.status(400).json({ message: "PIN not set" });

        const bcrypt = require("bcryptjs");
        const match = await bcrypt.compare(pin, account.pin);
        if (!match) return res.status(401).json({ message: "Incorrect PIN" });

        // Issue a short-lived bank session token (expires in 15 minutes)
        const jwt = require("jsonwebtoken");
        const bankToken = jwt.sign(
            { userId: req.userId, type: "bank_session" },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );
        res.json({ message: "PIN verified", bankToken });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createAccount,
    setupAccount,
    getAccount,
    getTransactions,
    creditAccount,
    processTransaction,
    setPin,
    verifyPin
};
