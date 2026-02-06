const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal
} = require("../controllers/goalController");

// CREATE GOAL
router.post("/", protect, createGoal);

// GET ALL GOALS
router.get("/", protect, getGoals);

// UPDATE SAVED AMOUNT
router.put("/:id", protect, updateGoal);

// DELETE GOAL
router.delete("/:id", protect, deleteGoal);

module.exports = router;
