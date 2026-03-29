const mongoose = require("mongoose");
const BankAccount = require("./models/BankAccount");
const User = require("./models/User");
const { setupAccount } = require("./controllers/bankController");
const dotenv = require("dotenv");

dotenv.config();

// Mock Request/Response
const req = {
    body: {
        accountNumber: "1234567890",
        balance: "50000"
    },
    userId: null // Will set after finding user
};

const res = {
    status: function (code) {
        console.log(`Response Status: ${code}`);
        return this;
    },
    json: function (data) {
        console.log("Response Data:", JSON.stringify(data, null, 2));
        return this;
    }
};

async function runDebug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Create temporary user
        const testEmail = "debug_" + Date.now() + "@test.com";
        const user = await User.create({ email: testEmail, password: "password123" });
        req.userId = user._id;
        console.log(`Created Debug User: ${user._id}`);

        // 2. Call setupAccount
        console.log("--- TEST 1: Valid Setup ---");
        await setupAccount(req, res);

        // 3. Duplicate Test
        console.log("--- TEST 2: Duplicate Setup (Should Fail 400) ---");
        await setupAccount(req, res);

        // 4. Invalid Balance
        console.log("--- TEST 3: Invalid Balance ---");
        req.body.balance = "Invalid";
        req.body.accountNumber = "9999999999";
        await setupAccount(req, res);

        // Cleanup
        await User.findByIdAndDelete(user._id);
        await BankAccount.deleteMany({ userId: user._id });
        console.log("Cleanup Done");

    } catch (err) {
        console.error("DEBUG SCRIPT CRASH:", err);
    } finally {
        await mongoose.disconnect();
    }
}

runDebug();
