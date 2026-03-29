const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BankAccount",
        required: true
    },
    type: {
        type: String,
        enum: ["CREDIT", "DEBIT"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    relatedGoalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SavingsGoal",
        default: null
    },
    balanceAfter: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
