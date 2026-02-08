const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://savingsgoaltracker.onrender.com/api/auth/google/callback",
    },
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    // 🔹 IMPORTANT: find by email FIRST
    let user = await User.findOne({ email });

    // Only create user if email does not exist
    if (!user) {
      user = await User.create({
        email,
        password: "GOOGLE_AUTH"
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}
  )
);

// REQUIRED (even if you don’t use sessions)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
