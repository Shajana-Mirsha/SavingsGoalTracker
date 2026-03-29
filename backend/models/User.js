const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  // password is optional for Google users
  password: {
    type: String,
    default: null
  },

  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER"
  },

  googleId: {
    type: String,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("User", userSchema);
