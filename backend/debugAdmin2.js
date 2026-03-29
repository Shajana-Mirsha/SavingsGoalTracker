const mongoose = require('mongoose');
const adminController = require('./controllers/adminController');
const User = require('./models/User');
require('dotenv').config();

const reqMock = (body = {}, params = {}) => ({ body, params });
const resMock = {
    json: (data) => console.log("SUCCESS:", JSON.stringify(data).substring(0, 200) + "..."),
    status: (code) => {
        console.log(`STATUS ${code}`);
        return { json: (data) => console.log(`ERROR DATA:`, data) };
    }
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to DB");

    // Create new user
    const email = `testuser_${Date.now()}@example.com`;
    console.log(`Creating user ${email}...`);
    await adminController.createUser(reqMock({ email, password: "password123", role: "USER" }), resMock);

    // Find the user to get ID
    const user = await User.findOne({ email });
    if (user) {
        console.log("User found:", user._id);

        // Update user
        console.log("Updating user...");
        await adminController.updateUser(reqMock({ email: `updated_${email}`, role: "ADMIN" }, { id: user._id }), resMock);

        // Delete user
        console.log("Deleting user...");
        await adminController.deleteUser(reqMock({}, { id: user._id }), resMock);
    } else {
        console.error("User creation failed, user not found in DB.");
    }

    process.exit();
}).catch(err => {
    console.error("Critical Error:", err);
    process.exit(1);
});
