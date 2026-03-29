const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("AUTH DEBUG: Decoded:", decoded);
    req.userId = decoded.userId || decoded.id;
    console.log("AUTH DEBUG: req.userId set to:", req.userId);
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    if (!process.env.JWT_SECRET) console.error("CRITICAL: JWT_SECRET IS MISSING IN ENV");
    return res.status(401).json({ message: "Invalid token" });
  }
};
