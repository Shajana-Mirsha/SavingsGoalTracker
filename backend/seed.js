const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const BankAccount = require("./models/BankAccount");
const SavingsGoal = require("./models/SavingsGoal");
const Transaction = require("./models/Transaction");
const { createAccount, processTransaction } = require("./controllers/bankController");

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected...");

        // 1. Create Admin
        const adminEmail = "shajanamirsha13@gmail.com";
        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            const adminHashed = await bcrypt.hash("admin123", 10);
            admin = await User.create({
                email: adminEmail,
                password: adminHashed,
                role: "ADMIN",
                isDeleted: false
            });
            console.log("Admin created: shajanamirsha13@gmail.com");
        } else {
            console.log("Admin already exists.");
            let updated = false;
            // Ensure role is ADMIN
            if (admin.role !== "ADMIN") {
                admin.role = "ADMIN";
                updated = true;
            }
            // Ensure not deleted
            if (admin.isDeleted) {
                admin.isDeleted = false;
                updated = true;
            }

            if (updated) {
                await admin.save();
                console.log("Admin role/status corrected.");
            }
        }

        // 2. Create User
        const userEmail = "shajanamirsha.ct23@bitsathy.ac.in";
        let user = await User.findOne({ email: userEmail });
        if (!user) {
            const userHashed = await bcrypt.hash("user123", 10);
            user = await User.create({
                email: userEmail,
                password: userHashed,
                role: "USER",
                isDeleted: false
            });
            console.log("User created: shajanamirsha.ct23@bitsathy.ac.in");
        } else {
            console.log("User already exists.");
            if (user.isDeleted) {
                user.isDeleted = false;
                await user.save();
                console.log("User reactivated.");
            }
        }

        // 3. Create Bank Account
        let account = await BankAccount.findOne({ userId: user._id });
        if (!account) {
            account = await createAccount(user._id);
            console.log("Bank account created.");
        } else {
            console.log("Bank account already exists.");
        }

        // 4. Initial Deposit (Transaction) - Only if balance is low (simulating initial state)
        // or checks specific transaction.
        // Let's check if "Initial Deposit" exists
        const initialDeposit = await Transaction.findOne({ userId: user._id, purpose: "Initial Deposit" });
        if (!initialDeposit) {
            console.log("Processing initial deposit...");
            try {
                await processTransaction({
                    userId: user._id,
                    type: "CREDIT",
                    amount: 10000,
                    purpose: "Initial Deposit",
                    relatedGoalId: null
                });
                console.log("Initial deposit successful.");
            } catch (txErr) {
                console.error("Initial deposit failed (likely insufficient funds or conflict):", txErr.message);
            }
        } else {
            console.log("Initial deposit already recorded.");
        }

        // 5. Create Sample Goals (Check if exists)
        let goal1 = await SavingsGoal.findOne({ userId: user._id, goalName: "MacBook Pro" });
        if (!goal1) {
            goal1 = await SavingsGoal.create({
                userId: user._id,
                goalName: "MacBook Pro",
                targetAmount: 200000,
                savedAmount: 50000,
                deadline: new Date("2026-12-31"),
                history: [
                    { amount: 50000, date: new Date() }
                ]
            });
            console.log("Goal 'MacBook Pro' created.");

            // Deduct for goal (Simulate)
            try {
                await processTransaction({
                    userId: user._id,
                    type: "DEBIT",
                    amount: 50000,
                    purpose: "Contribution to MacBook Pro",
                    relatedGoalId: goal1._id
                });
                console.log("Goal 1 contribution processed.");
            } catch (err) { console.error("Goal 1 txn failed:", err.message); }
        } else {
            console.log("Goal 'MacBook Pro' already exists.");
        }

        // 6. Another Goal
        let goal2 = await SavingsGoal.findOne({ userId: user._id, goalName: "Goa Trip" });
        if (!goal2) {
            goal2 = await SavingsGoal.create({
                userId: user._id,
                goalName: "Goa Trip",
                targetAmount: 30000,
                savedAmount: 5000,
                deadline: new Date("2026-06-15"),
                history: [
                    { amount: 5000, date: new Date() }
                ]
            });
            console.log("Goal 'Goa Trip' created.");

            try {
                await processTransaction({
                    userId: user._id,
                    type: "DEBIT",
                    amount: 5000,
                    purpose: "Contribution to Goa Trip",
                    relatedGoalId: goal2._id
                });
                console.log("Goal 2 contribution processed.");
            } catch (err) { console.error("Goal 2 txn failed:", err.message); }
        } else {
            console.log("Goal 'Goa Trip' already exists.");
        }

        // 7. Salary Deposit
        // Only add if not recently added? For now, let's just check if ANY salary exists, or just skip to avoid spamming wallet if run multiple times.
        const salaryTxn = await Transaction.findOne({ userId: user._id, purpose: "February Salary" });
        if (!salaryTxn) {
            try {
                await processTransaction({
                    userId: user._id,
                    type: "CREDIT",
                    amount: 100000,
                    purpose: "February Salary",
                    relatedGoalId: null
                });
                console.log("Salary deposit processed.");
            } catch (err) { console.error("Salary txn failed:", err.message); }
        }

        console.log("Seeding complete. Process exiting.");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
