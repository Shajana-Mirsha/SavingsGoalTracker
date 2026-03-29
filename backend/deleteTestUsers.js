const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");
const BankAccount = require("./models/BankAccount");
const Transaction = require("./models/Transaction");
const SavingsGoal = require("./models/SavingsGoal");

const emailsToDelete = [
    "updated_testuser_1771224386477@example.com",
    "demo@vaultgoal.com",
    "test_api_1771259191598@test.com"
];

async function deleteUsers() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    for (const email of emailsToDelete) {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`[SKIP] Not found: ${email}`);
            continue;
        }
        const id = user._id;
        await SavingsGoal.deleteMany({ userId: id });
        await BankAccount.deleteMany({ userId: id });
        await Transaction.deleteMany({ userId: id });
        await User.findByIdAndDelete(id);
        console.log(`[DELETED] ${email}`);
    }

    await mongoose.disconnect();
    console.log("Done.");
}

deleteUsers().catch(console.error);
