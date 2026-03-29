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

    console.log(`Google Callback - User: ${req.user.email}, Role: ${req.user.role}`); // DEBUG LOG
   res.redirect(
  `${process.env.CLIENT_URL || "http://localhost:3000"}/dashboard?token=${token}&role=${req.user.role}`
);
  }
);

module.exports = router;
