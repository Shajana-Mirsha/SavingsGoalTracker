const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  bankName: {
    type: String,
    default: "Vault Bank",
    immutable: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 10000,
    min: 0
  },
  pin: {
    type: String,
    default: null   // null = PIN not yet set
  }
}, { timestamps: true });

module.exports = mongoose.model("BankAccount", bankAccountSchema);
