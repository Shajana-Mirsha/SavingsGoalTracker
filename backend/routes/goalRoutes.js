const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const goalController = require("../controllers/goalController");

router.post("/", auth, goalController.createGoal);
router.get("/", auth, goalController.getGoals);
router.put("/:id", auth, goalController.updateGoal);
router.delete("/:id", auth, goalController.deleteGoal);

module.exports = router;
