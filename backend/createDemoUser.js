const mongoose = require("mongoose");
const User = require("./models/User");
const BankAccount = require("./models/BankAccount");
const bcrypt = require("bcryptjs");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to DB");

        // Create Standard User
        const email = "demo@vaultgoal.com";
        const password = "password123";

        let user = await User.findOne({ email });
        if (user) {
            console.log("Demo user already exists");
            // Update password just in case
            user.password = await bcrypt.hash(password, 10);
            user.role = "USER"; // Ensure role is USER
            await user.save();
            console.log("Demo user password updated");
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                email,
                password: hashedPassword,
                role: "USER"
            });
            console.log("Demo user created");
        }

        // Ensure Bank Account exists
        const account = await BankAccount.findOne({ userId: user._id });
        if (!account) {
            await BankAccount.create({
                userId: user._id,
                accountNumber: Math.floor(1000000000 + Math.random() * 9000000000),
                balance: 50000
            });
            console.log("Bank account created for demo user");
        } else {
            console.log("Bank account already exists");
        }

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
