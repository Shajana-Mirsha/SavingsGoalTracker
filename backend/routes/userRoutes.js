const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { deleteAccount } = require("../controllers/userController");

// DELETE ACCOUNT
router.delete("/delete-account", auth, deleteAccount);

module.exports = router;
