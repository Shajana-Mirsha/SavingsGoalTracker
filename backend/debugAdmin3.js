const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to DB");

    console.log("Querying { isDeleted: { $ne: true } }...");
    const users = await User.find({ role: "USER", isDeleted: { $ne: true } });
    console.log(`Found ${users.length} active users.`);
    users.forEach(u => console.log(`User: ${u.email}, isDeleted: ${u.isDeleted}`));

    console.log("\nChecking Admin User (shajanamirsha13@gmail.com):");
    const specific = await User.findOne({ email: "shajanamirsha13@gmail.com" });
    if (specific) {
        console.log(`Admin Found. ID: ${specific._id}, Role: ${specific.role}, isDeleted: ${specific.isDeleted}`);
    } else {
        console.log("Admin User NOT FOUND in DB.");
    }

    process.exit();
}).catch(err => {
    console.error("Critical Error:", err);
    process.exit(1);
});
