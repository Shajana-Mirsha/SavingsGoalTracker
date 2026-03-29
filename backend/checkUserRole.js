const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const email = "shajanamirsha13@gmail.com";
        const user = await User.findOne({ email });
        if (user) {
            console.log(`User found: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`IsDeleted: ${user.isDeleted}`);
        } else {
            console.log("User not found");
        }
        mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        mongoose.connection.close();
    });
