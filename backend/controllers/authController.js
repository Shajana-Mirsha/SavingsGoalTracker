const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER (ONLY FOR NEW USERS)
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  // Check if already registered
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      message: "User already registered. Please login."
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    email,
    password: hashedPassword
  });

  res.status(201).json({
    message: "Registration successful. Please login."
  });
};

// LOGIN (ONLY IF ALREADY REGISTERED)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "User not registered. Please register first."
    });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      message: "Incorrect password."
    });
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
};
