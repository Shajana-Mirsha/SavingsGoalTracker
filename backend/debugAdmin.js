const mongoose = require('mongoose');
const adminController = require('./controllers/adminController');
require('dotenv').config();

const req = { body: {}, params: {} };
const res = {
    json: (data) => console.log("SUCCESS:", JSON.stringify(data).substring(0, 100) + "..."),
    status: (code) => ({ json: (data) => console.log(`ERROR ${code}:`, data) })
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to DB");
    try {
        console.log("Testing getSystemStats...");
        await adminController.getSystemStats(req, res);

        console.log("Testing getAllUsers...");
        await adminController.getAllUsers(req, res);

        console.log("Testing getAllAccounts...");
        await adminController.getAllAccounts(req, res);

        console.log("Testing getAllGoals...");
        await adminController.getAllGoals(req, res);

        console.log("Testing getAllTransactions...");
        await adminController.getAllTransactions(req, res);

    } catch (e) {
        console.error("CRITICAL TEST ERROR:", e);
    }
    process.exit();
}).catch(err => {
    console.error("DB Connection Error:", err);
    process.exit(1);
});
