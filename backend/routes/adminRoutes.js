const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get("/stats", controller.getSystemStats);

// Users
router.get("/users", controller.getAllUsers);
router.post("/users", controller.createUser);
router.put("/users/:id", controller.updateUser);
router.delete("/users/:id", controller.deleteUser);

// Bank Accounts
router.get("/accounts", controller.getAllAccounts);
router.put("/accounts/:id", controller.updateAccountBalance);

// Goals
router.get("/goals", controller.getAllGoals);
router.put("/goals/:id", controller.updateGoal);
router.delete("/goals/:id", controller.deleteGoal);

// Transactions
router.get("/transactions", controller.getAllTransactions);
router.post("/transactions/:id/reverse", controller.reverseTransaction);

module.exports = router;
