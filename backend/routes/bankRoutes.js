const express = require("express");
const router = express.Router();
const { getAccount, getTransactions, creditAccount, setupAccount, setPin, verifyPin } = require("../controllers/bankController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes protected by JWT auth
router.use(authMiddleware);

router.post("/setup", setupAccount);
router.get("/account", getAccount);
router.get("/transactions", getTransactions);
router.post("/credit", creditAccount);
router.post("/debit", require("../controllers/bankController").processTransaction ? async (req, res) => {
    try {
        const { processTransaction } = require("../controllers/bankController");
        const result = await processTransaction({
            userId: req.userId,
            type: "DEBIT",
            amount: parseFloat(req.body.amount),
            purpose: req.body.purpose || "Withdrawal"
        });
        res.json({ message: "Withdrawal successful", transaction: result });
    } catch (err) {
        res.status(400).json({ message: err.message || "Withdrawal failed" });
    }
} : (req, res) => res.status(501).json({ message: "Not implemented" }));

router.post("/set-pin", setPin);
router.post("/verify-pin", verifyPin);

module.exports = router;
