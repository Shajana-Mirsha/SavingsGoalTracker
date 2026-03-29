const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goalController");
const auth = require("../middleware/authMiddleware");

// If any of these are undefined, Node will throw that TypeError
router.post("/", auth, goalController.createGoal);   // Line 7
router.get("/", auth, goalController.getGoals);
router.put("/:id", auth, goalController.updateGoal);
router.put("/:id/extend", auth, goalController.extendGoalDate);
router.delete("/:id", auth, goalController.deleteGoal);

module.exports = router;