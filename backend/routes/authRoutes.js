const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const authController = require("../controllers/authController");

// Email login
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

// Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET
    );

    res.redirect(
      `https://savings-goal-tracker-frontend.onrender.com/dashboard?token=${token}`
    );
  }
);

module.exports = router;
